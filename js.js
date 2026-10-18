/* console.log(true&&"hello");
console.log(false&&"hello");

console.log(true||"ORgate");
console.log(false&&25   >= 0);

 */
let i = 0;

function as(){

    const interval =  setInterval(()=>{
        console.log("hello world",i);
        i++;
        
    },1000)
    
    console.log("this after the interval");

    return "end";

}

let a = as();

console.log(a);

