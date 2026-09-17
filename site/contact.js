export function isPrivacyUrl(value) {
 if(value === "/aviso-de-privacidad.html") return true;
 try {const url=new URL(value);return url.protocol==='https:' && Boolean(url.hostname) && !url.username && !url.password;}
 catch {return false;}
}
export function requestContactLink(config,message) {
 if(config.requestSharingEnabled !== true) return null;
 if(!/^[1-9]\d{7,14}$/.test(config.whatsappNumber) || !isPrivacyUrl(config.privacyUrl)) return null;
 if(typeof message!=='string' || !message.trim()) return null;
 return `https://wa.me/${config.whatsappNumber}?text=${encodeURIComponent(message)}`;
}
