<<<<<<< HEAD
export function loadAsset(path){
    let newAsset;
    if(path.includes("sprites")){
        newAsset = new Image();
    }else{
        newAsset = new Audio();
    }
    newAsset.src = `${path}`;
    newAsset.onerror = () =>
        console.error(`Failed to load ${path}`);
    return newAsset;
=======
export function loadAsset(path){
    let newAsset;
    if(path.includes("sprites")){
        newAsset = new Image();
    }else{
        newAsset = new Audio();
    }
    newAsset.src = `${path}`;
    newAsset.onerror = () =>
        console.error(`Failed to load ${path}`);
    return newAsset;
>>>>>>> c08fb4917bc6e74678cc3fb3bb073ca090cb0926
}