function getCookie(name: string) {
  if (!document.cookie) {
    return null;
  }

  const xsrfCookies = document.cookie
    .split(';')
    .map((c) => c.trim())
    .filter((c) => c.startsWith(name + '='));

  if (xsrfCookies.length === 0) {
    return null;
  }
  return decodeURIComponent(xsrfCookies[0].split('=')[1]);
}

const csrfToken = getCookie('csrftoken');
const headers = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
  'X-CSRFToken': `${csrfToken}`,
  'Media-Type': '"application/json"',
};
export async function POST(url: string, data?: object) {
  return await fetch(url, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(data),
  });
}

export async function PUT(url: string, data: object) {
  return await fetch(url, {
    method: 'PUT',
    headers: headers,
    body: JSON.stringify(data),
  });
}
export async function DELETE(url: string) {
  return await fetch(url, {
    method: 'DELETE',
    headers: headers,
  });
}
