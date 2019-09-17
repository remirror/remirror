declare module 'storejs' {
  export = storejs;

  declare function storejs(key: any, data: any, ...args: any[]): any;

  declare namespace storejs {
    function clear(): any;
    function forEach(callback: any): any;
    function get(key: any, ...args: any[]): any;
    function has(key: any): any;
    function keys(): any;
    function remove(key: any): any;
    function search(str: any): any;
    function set(key: any, val: any): any;
  }
}
