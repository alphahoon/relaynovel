function OnDropDownChange(dropDown, input) {
    var selectedValue = dropDown.options[dropDown.selectedIndex].value;
    document.getElementById(input).value = selectedValue;
}