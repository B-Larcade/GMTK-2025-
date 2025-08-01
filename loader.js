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
}