function createMenu(){
	let buttons=[]
	function onClickSomewhere(x,y){
		for (button of buttons){
			button.onClickSomewhere(x,y)
		}
	}
	function changeButtonList(buttonList){
		buttons=buttonList
	}
	return {
		onClickSomewhere:onClickSomewhere,
		changeButtonList:changeButtonList,
	}
}