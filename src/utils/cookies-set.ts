import cookies from 'js-cookie';

export const cookieGet = (key: string) => {
  if (typeof window === 'undefined') return "";
  return cookies.get(key);
};

export const cookieSet = (key: string,value: any) => {
  if (typeof window === 'undefined') return;
  let parseValue = "";
  if(typeof value !== 'string'){
    parseValue = JSON.stringify(value||{});
  }else{
    parseValue = value;
  }
  console.log('cookieSet',key, parseValue);
  cookies.set(key, parseValue, { expires: 7 });
};

export const cookieRemove = (key:string) => {
  if (typeof window === 'undefined') return;
  cookies.remove(key);
};
