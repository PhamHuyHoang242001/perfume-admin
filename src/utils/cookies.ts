type CookieOptions = {
  expires?: Date;
  path?: string;
  domain?: string;
  secure?: boolean;
  sameSite?: 'Strict' | 'Lax';
};

function setCookie(name: string, value: string, options?: CookieOptions): void {
  let cookieStr = `${name}=${encodeURIComponent(value)}`;

  if (options) {
    const { expires, path, domain, secure, sameSite } = options;
    if (expires) {
      cookieStr += `; expires=${expires.toUTCString()}`;
    }
    if (path) {
      cookieStr += `; path=${path}`;
    }
    if (domain) {
      cookieStr += `; domain=${domain}`;
    }
    if (secure) {
      cookieStr += `; secure`;
    }
    if (sameSite) {
      cookieStr += `; SameSite=${sameSite}`;
    }
  }

  document.cookie = cookieStr;
}

function getCookie(name: string): string | null {
  const cookieStr = document.cookie;
  const cookiePairs = cookieStr.split(';');

  for (let i = 0; i < cookiePairs.length; i++) {
    const pair = cookiePairs[i].trim().split('=');
    if (decodeURIComponent(pair[0]) === name) {
      return decodeURIComponent(pair[1]);
    }
  }

  return null;
}

function deleteCookie(name: string, options?: CookieOptions): void {
  setCookie(name, '', { ...options, expires: new Date(0) });
}

export { deleteCookie, getCookie, setCookie };
