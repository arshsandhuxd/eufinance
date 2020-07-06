/********************************************************************************
* Javacript for Lot Calc														*
*																				*
* Version: 		1.2 															*
* Date: 		2013-04-26 														*
* Author: 		Marketics CAS - Frank Rehfeldt, April Talampas 					*
* Copyright: 	Nils Rehfeldt													*
*																				*
********************************************************************************/

var tblData;
var firstRow;
var position = 1;
var intervalId;
var sessionSet = "";
var sessionGroupSave = false;

function addRow(sessionPair) {
	sessionPair = (typeof sessionPair != "undefined") ? sessionPair : false;

	var tblDataTBody;
	var newRow = firstRow.cloneNode(true);

	tblDataTBody = tblData.children[0];
	newRow.style.display = "table-row";

	var curData = getCurrentPairs();

	// IE needs to append first before using cells[] accessors
	tblDataTBody.appendChild(newRow);

	if(sessionPair) {
		setElemAttribs(newRow, sessionPair);
		var firstPair = (newRow.cells[1].firstElementChild || newRow.cells[1].children[0] );
		firstPair.innerHTML = sessionPair;
		addPos = true;
		position++;
	} else {
		setElemAttribs(newRow);
		var firstPair = (newRow.cells[1].firstElementChild || newRow.cells[1].children[0] );
		var newPair = firstPair.innerHTML;
		
		if(curData.indexOf(newPair) != -1) {
			tblDataTBody.removeChild(newRow);
			addPos = false;
			alert("Das Währungspaar befindet sich bereits in der Tabelle.");
		} else {
			addPos = true;
			addToSession(newPair);
			position++;
		}
	}
	resetPos();
}

function addToSession(pairText) {
	sessionSet += pairText + ",";
	if(!sessionGroupSave) {
		saveSession();
	}
}

function calculateRiskBal() {
	var balance = parseFloat(document.getElementById("balance").value);
	var risk = parseFloat(document.getElementById("risk").value)/100;

	var riskBal = parseFloat(balance * risk).toFixed(2);
	document.getElementById("riskBal").innerHTML = numberWithCommas(riskBal);

	refresh();
}

function createConversionPairs(currencyVal, currencies) {
	var cPairs = "";
	for (var i = 0; i < currencies.length; i++) {
		cPairs += "," + currencyVal + currencies[i];
	}

	cPairs = cPairs.substring(1);
	return cPairs;
}

function delRow(el) {
	var cell = el.parentElement;
	var row = cell.parentElement;

	// Sicherheitsabfrage deaktiviert
	// if (confirm("Are you sure you want to delete?")) {
		var firstEl = (row.cells[1].firstElementChild || row.cells[1].children[0]);
		removeFromSession(firstEl.innerHTML);
		tblData.deleteRow(row.rowIndex);
		resetPos();
	// }
}

function doCalculations(el) {
	var cell = el.parentElement;
	var row = cell.parentElement;
	var colCount = row.cells.length;
	var inputVal = parseFloat(el.value);
	var	riskBal = stripNonNumeric(document.getElementById("riskBal").innerHTML);
	var currencyVal = getSelectedOptionVal(document.getElementById("currency"));
	var balance = parseFloat(document.getElementById("balance").value);

	for(var i=0; i<colCount; i++) {
		var cell = row.cells[i];
		var element = (cell.firstElementChild || cell.children[0]);
		var firstEL = (row.cells[i].firstElementChild || row.cells[i].children[0]);
		var jpyPairCheckTrue = getSecondCurrency(row).localeCompare('JPY');

		switch(i) {
			case 3:
				var sppId = firstEL.id;
				var sppEl = document.getElementById(sppId);

				if( inputVal > 0) {
					sppEl.innerHTML = parseFloat(riskBal/inputVal).toFixed(4);
				} else {
					sppEl.innerHTML = 0;
				}
			break;

			case 4:
				var unitsId = firstEL.id;
				var unitsEl = document.getElementById(unitsId);
		
				// Check for JPY pairs and adjust calc starts here

 				if (jpyPairCheckTrue == 0) {
 					var thouPercent = 0.01;
 				} else {
					var thouPercent = 0.0001;
				}
				
				// End

				var conValId = currencyVal.toLowerCase()+getSecondCurrency(row).toLowerCase()+"_val";

				var conValEl = document.getElementById(conValId);
				if(typeof conValEl== 'undefined' || conValEl != null) {
					var unitsCalc = ((parseFloat(sppEl.innerHTML) * parseFloat(conValEl.innerHTML)) / thouPercent).toFixed(0);
				unitsEl.innerHTML = numberWithCommas(unitsCalc);
				}
			break;

			case 5:
				var lotsId = firstEL.id;
				var lotsEl = document.getElementById(lotsId);
				var thousand = 100000;
				// var lotsCalc = unitsCalc / balance;
				// lotsEl.innerHTML = parseFloat(unitsCalc / balance).toFixed(3);
				lotsEl.innerHTML = parseFloat(unitsCalc / thousand).toFixed(3);
			break;
		}

	}
}

function fillOptions(selEl, selArr, sortArr, addText) {
	sortArr = (typeof sortArr != "undefined") ? sortArr : true;
	addText = (typeof addText != "undefined") ? addText : false;

	if(sortArr == true) {
		selArr.sort();
	}

	for (i = 0; i < selArr.length; i++) {
		var option = document.createElement("option");
		selEl.appendChild(option);

		if(addText) {
		option.text = selArr[i] + " Sekunden";
		option.value = selArr[i];
		} else {
			option.text = selArr[i];
			option.value = selArr[i];
		}
	}
}

// Get the current pairs of current pair column of tblData table
function getCurrentPairs() {
	var curPairs = "";
	var rowCount = tblData.rows.length;

	for(var i=1; i<rowCount; i++) {
		var row = tblData.rows[i];

		if (row.style.display != "none") {
			var firstEl = (row.cells[1].firstElementChild || row.cells[1].children[0]);
			curPairs += firstEl.innerHTML + ",";
		}
		
	}
	return curPairs;
}

function getElementSibling(el, direction) {
	var elElementSib, elSib;

	switch(direction) {
		case "prev":
			elElementSib = el.previousElementSibling;
			elSib = el.previousSibling;
		break;

		case "next":
			elElementSib = el.nextElementSibling;
			elSib = el.nextSibling;
		break;
	}

	if(elElementSib ) {
		return elElementSib;
	} else {
		while( el = elSib ) {
			if( el.nodeType === 1 ) {
				return el;
			}
		}
	}
}

function getSecondCurrency(row) {
	var firstEl = (row.cells[1].firstElementChild || row.cells[1].children[0]);
	return firstEl.innerHTML.slice(-3);
}

function getSelectedOptionVal(selectBox) {
	return selectBox.options[selectBox.selectedIndex].value;
}

function getSessionCurrency() {
	sendRequest("/lot_calc.php", requestResult, "op=getCurrency");
}

function init() {
	sessionGroupSave = true;
	tblData = document.getElementById("tblData");
	firstRow = tblData.rows[1];

	var selSetPair = document.getElementById("selSetPair");
	fillOptions(selSetPair, pairs, true, false);

	var currency = document.getElementById("currency");
	fillOptions(currency, currencies, true, false);

	var selInterval = document.getElementById("selInterval");
	fillOptions(selInterval, intervals, false, true);

	setSettings();
}

function loadSessionSet(sessionSetArr) {
	for(var i=0; i<sessionSetArr.length; i++) {
		addRow(sessionSetArr[i]);
		addToSession(sessionSetArr[i]);
	}
	if(sessionGroupSave) {
		sessionGroupSave = false;
		saveSession();
	}
}



function moveDownRow(el) {
	var cell = el.parentElement;
	var row = cell.parentElement;

	var next = getElementSibling(row, "next");
	var tBody = row.parentNode;

	tBody.removeChild(row);
	var next2 = getElementSibling(next, "next");

	if (next2 && (next.style.display != "none")) {
		tBody.insertBefore(row, next.nextSibling);
	} else {
		tBody.appendChild(row);
	}
	resetPos();
	resetSessionSet();
}

function moveUpRow(el) {
	var cell = el.parentElement;
	var row = cell.parentElement;

	var prev = getElementSibling(row, "prev");
	var tBody = row.parentNode;

	if (prev && (prev.style.display != "none")) {
		tBody.removeChild(row);
		tBody.insertBefore(row, prev);
		resetPos();
		resetSessionSet();
	}
}

function numberWithCommas(num) {
	var parts=num.toString().split(".");
	return parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") + (parts[1] ? "." + parts[1] : "");
}

function prevRowSibling(row) {
	if(row.previousElementSibling ) {
		return row.previousElementSibling;
	} else {
		while( row = row.previousSibling ) {
			if( row.nodeType === 1 ) {
				return row;
			}
		}
	}
}

function refresh() {
	var rowCount = tblData.rows.length;

	for(var i=1; i<rowCount; i++) {
		var row = tblData.rows[i];

		if (row.style.display != "none") {
			var firstEl = (row.cells[2].firstElementChild || row.cells[2].children[0]);
			doCalculations(firstEl);
		}
	}
}

function removeFromSession(pairText) {
	sessionSet = sessionSet.replace(pairText + ",", "");
	saveSession();
}

function requestResult(req) {
	eventData = req.responseText;

	if(eventData.indexOf("<tr><th>Pair</th><th>Value</th>") != -1) {
		var tblConversions = document.getElementById("tblConversions");
		var eData = eventData.split("[BRK]");
		document.getElementById('loader').style.display = "none";

		// if (typeof tblConversions.innerHTML != "undefined") {
			// tblConversions.innerHTML = eData[0];
		// } else {
			// For IE
			tableInnerHTML(tblConversions, eData[0]);
		// }
		document.getElementById("currency").value = eData[1];
		sessionCur = eData[1];
		refresh();

		resetInterval();
	}

	if(eventData.indexOf("getCurrency:") != -1) {
		sessionCur = eventData.slice(13);
		if(!sessionCur) {
			sessionCur = defaultCur;
		}

		document.getElementById("currency").value = sessionCur;
		var curPairs = createConversionPairs(sessionCur, currencies);
		setCurrency(sessionCur, curPairs);
	}

	if(eventData.indexOf("getInterval:") != -1) {
		var sessionInterval = eventData.slice(13);
		if(!sessionInterval) {
			sessionInterval = defaultInterval;
		}
		document.getElementById("selInterval").value = sessionInterval;
	}

	if(eventData.indexOf("getSession:") != -1) {
		var curSessionSet = eventData.slice(12);

		if(curSessionSet) {
			var sessionSetArr = curSessionSet.split(",");
		} else {
			var sessionSetArr = defaultSet.split(",");
		}

		loadSessionSet(sessionSetArr);
	}
}

function resetInterval() {
	var currencyVal = document.getElementById("currency").value;
	var curPairs = createConversionPairs(currencyVal, currencies);
	var curInterval = parseInt(document.getElementById("selInterval").value) * 1000;
	intervalId = setInterval(function() {
						setCurrency(currencyVal, curPairs);
					}, curInterval);
}

function resetPos() {
	var rowCount = tblData.rows.length;

	var firstPos = 1;
	for(var i=1; i<rowCount; i++) {
		var row = tblData.rows[i];

		if (row.style.display != "none") {
			var firstPosition = (row.cells[0].firstElementChild || row.cells[0].children[0] );
			firstPosition.innerHTML = firstPos++;

			var firstSL = (row.cells[2].firstElementChild || row.cells[2].children[0]);
			firstSL.tabIndex = i+2;

			if( i == 2) {
				row.cells[6].children[1].style.display = "none";
			} else {
				row.cells[6].children[1].style.display = "inline-block";
			}

			if( i == (rowCount-1)) {
				row.cells[6].children[2].style.display = "none";
			} else {
				row.cells[6].children[2].style.display = "inline-block";
			}
		}
	}
}

function resetSessionSet() {
	var rowCount = tblData.rows.length;
	sessionSet = "";

	sessionGroupSave = true;
	for(var i=1; i<rowCount; i++) {
		var row = tblData.rows[i];

		if (row.style.display != "none") {
			var firstEl = (row.cells[1].firstElementChild || row.cells[1].children[0]);
			addToSession(firstEl.innerHTML);
		}
	}
	sessionGroupSave = false;
	saveSession();
}

function saveSession() {
	sendRequest("/lot_calc.php", requestResult, "op=setSession&set="+sessionSet.slice(0, -1));
}

function setCurrency(currencyVal, currentPairs) {
	clearInterval(intervalId);
	document.getElementById('loader').style.display= "inline-block";
	sendRequest("/lot_calc.php", requestResult, "op=setCurrency&cur="+currencyVal+"&pairs="+currentPairs);
}

function setElemAttribs(row, pairText) {
	var colCount = row.cells.length;
	var postFix;
	var selSetPair = getSelectedOptionVal(document.getElementById('selSetPair'));
	pairText = (typeof pairText != "undefined") ? pairText : selSetPair;

	for(var i=0; i<colCount; i++) {
		var cell = row.cells[i];
		var element = (cell.firstElementChild || cell.children[0]);

		switch(i) {
			case 0:
				postFix = "pos";
				var posVal = position;
				element.innerHTML = posVal;
			break;

			case 1:
				postFix = "pair";
				element.innerHTML = pairText;
			break;

			case 2:
				postFix = "sl";
				element.tabIndex = posVal;
			break;

			case 3:
				postFix = "spp";
			break;

			case 4:
				postFix = "units";
			break;

			case 5:
				postFix = "lots";
			break;
		}

		if(i != 6) {
			element.id = element.name = pairText.toLowerCase() +  "_" + postFix;
		}
	}
}

function setSelInterval(intervalVal) {
	var selInterval = document.getElementById("selInterval");
	selInterval.value = intervalVal;
	sendRequest("/lot_calc.php", requestResult, "op=setSelInterval&interval="+intervalVal);
}

function setSettings() {
	sendRequest("/lot_calc.php", requestResult, "op=getSession");
	sendRequest("/lot_calc.php", requestResult, "op=getCurrency");
	calculateRiskBal();
	sendRequest("/lot_calc.php", requestResult, "op=getInterval");
}

// Removes non-numeric characters
function stripNonNumeric( str ) {
	str += '';
	var rgx = /^\d|\.|-$/;
	var out = '';
	for( var i = 0; i < str.length; i++ ) {
		if( rgx.test( str.charAt(i) ) ){
			if( !( ( str.charAt(i) == '.' && out.indexOf( '.' ) != -1 ) ||
			( str.charAt(i) == '-' && out.length != 0 ) ) ){
				out += str.charAt(i);
			}
		}
	}
	return out;
}

function tableInnerHTML(tblTarget, rowHTML) {

	while (tblTarget.rows.length > 0) {
		tblTarget.deleteRow(0);
	}

	var tempDiv = document.createElement("div");
	document.body.appendChild(tempDiv);
	tempDiv.innerHTML = "<table id='tblTemp'>" + rowHTML + "</table>";
	var tblTemp = document.getElementById("tblTemp");

	//Copy temporary table's rows to target table
	// For IE
	if(typeof tblTarget.children[0] != "undefined") {
		for (var i = 0; i < tblTemp.rows.length; i++) {
			tblTarget.children[0].appendChild(tblTemp.rows[i].cloneNode(true))
		}
	} else {
		for (var i = 0; i < tblTemp.rows.length; i++) {
			tblTarget.appendChild(tblTemp.rows[i].cloneNode(true));
		}
	}

	tblTemp.parentNode.removeChild(tblTemp);
}