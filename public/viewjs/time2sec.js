function numFormat(variable){
	variable = Number(variable).toString();
	if(Number(variable) < 10 && variable.length == 1)
		variable = "0" + variable;
	return variable;
}

function time2sec(str){
  var strtoken = str.split(":");
  for (var i = 0; i < strtoken.length; i++)
    strtoken[i]=parseInt(strtoken[i],10);
  var totalsec = 3600*strtoken[0] + 60*strtoken[1] + strtoken[2];
  return totalsec;
}

function sec2time(sec){
  var hr = Math.floor(sec/3600);
  sec = sec - 3600*hr;
  var min = Math.floor(sec/60);
  sec = sec - 60*min;
  var str = numFormat(hr)+':'+numFormat(min)+':'+numFormat(sec);
  return str;
}