import { NextRequest, NextResponse } from "next/server";
import https from "https";

export const runtime = "nodejs";

const BACKEND_URL = process.env.BACKEND_API_URL || "https://52.14.71.203:8443";

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

export async function POST(req: NextRequest) {
  const backendUrl = `${BACKEND_URL}/execute`;
  
  try {
    const body = await req.json();
    
    console.log(`[API Proxy] Proxying request to backend: ${backendUrl}`);
    console.log(`[API Proxy] Payload size: ${JSON.stringify(body).length} bytes`);
    
    const url = new URL(backendUrl);
    const requestBody = JSON.stringify(body);
    
    return new Promise<NextResponse>((resolve) => {
      const options = {
        hostname: url.hostname,
        port: url.port || 8443,
        path: url.pathname,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(requestBody),
        },
        agent: httpsAgent,
      };
      
      const httpsReq = https.request(options, (res) => {
        console.log(`[API Proxy] Backend response status: ${res.statusCode} ${res.statusMessage}`);
        
        let responseData = "";
        
        res.on("data", (chunk) => {
          responseData += chunk;
        });
        
        res.on("end", () => {
          console.log(`[API Proxy] Backend response body length: ${responseData.length} characters`);
          console.log(`[API Proxy] Backend response body:`, responseData);
          
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            try {
              const data = JSON.parse(responseData);
              console.log(`[API Proxy] Successfully parsed backend response`);
              console.log(`[API Proxy] Parsed data structure:`, JSON.stringify(data, null, 2));
              resolve(NextResponse.json(data));
            } catch (parseError) {
              console.error(`[API Proxy] Failed to parse backend JSON:`, parseError);
              resolve(NextResponse.json(
                { error: "Failed to parse backend response as JSON" },
                { status: 500 }
              ));
            }
          } else {
            let errorData;
            try {
              errorData = JSON.parse(responseData);
            } catch {
              errorData = { error: responseData || "Unknown error" };
            }
            
            console.error(`[API Proxy] Backend error response:`, errorData);
            resolve(NextResponse.json(
              { 
                error: `Backend error (${res.statusCode})`,
                details: errorData.error || errorData.details || responseData
              },
              { status: res.statusCode || 500 }
            ));
          }
        });
      });
      
      const timeoutMs = 7 * 60 * 1000; // 7 minutes
      const timeoutId = setTimeout(() => {
        httpsReq.destroy();
        console.error(`[API Proxy] Request timeout after 7 minutes to ${backendUrl}`);
        resolve(NextResponse.json(
          { error: "Backend request timeout" },
          { status: 504 }
        ));
      }, timeoutMs);
      
      httpsReq.on("error", (error) => {
        clearTimeout(timeoutId);
        console.error(`[API Proxy] Error proxying to backend:`, {
          message: error.message,
          name: error.name,
          stack: error.stack,
          url: backendUrl,
        });
        resolve(NextResponse.json(
          { 
            error: "Failed to connect to backend",
            details: error.message
          },
          { status: 502 }
        ));
      });
      
      httpsReq.write(requestBody);
      httpsReq.end();
    });
    
  } catch (error) {
    if (error instanceof Error) {
      console.error(`[API Proxy] Error in request handler:`, {
        message: error.message,
        name: error.name,
        stack: error.stack,
        url: backendUrl,
      });
      
      return NextResponse.json(
        { 
          error: "Internal server error",
          details: error.message
        },
        { status: 500 }
      );
    }
    
    console.error(`[API Proxy] Unknown error:`, error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
