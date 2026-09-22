/** Allow matching local development addresses without widening production origins. */
export function validRequestOrigin(request:Request,development=false){
 const raw=request.headers.get('origin');if(!raw)return false;
 try{const origin=new URL(raw),target=new URL(request.url);if(!['http:','https:'].includes(origin.protocol)||raw!==origin.origin)return false;if(origin.origin===target.origin)return true;
 if(!development||origin.protocol!==target.protocol||origin.host!==request.headers.get('host'))return false;
 const host=origin.hostname;return host==='localhost'||host==='[::1]'||/^127\./.test(host)||/^10\./.test(host)||/^192\.168\./.test(host)||/^172\.(1[6-9]|2\d|3[01])\./.test(host);
 }catch{return false;}
}
