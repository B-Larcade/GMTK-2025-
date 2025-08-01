function createMenuButton(x,y,w,h,clickfun){
	//width and height from top left corner to the bottom right corner
	let posx=x
	let posy=y
	let width=w
	let height=h
	let clickfunction=clickfun
	function onClickSomewhere(x,y){
		if(x>=posx&&x<=posx+width&&y>=posy&&y<=posy+height){
			clickfunction();
		}
	}
	return {
		onClickSomewhere:onClickSomewhere
	}
}