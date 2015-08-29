/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
		// Application Constructor
		initialize: function() {
			this.bindEvents();
		},
		// Bind Event Listeners
		//
		// Bind any events that are required on startup. Common events are:
		// 'load', 'deviceready', 'offline', and 'online'.
		bindEvents: function() {
			document.addEventListener('deviceready', this.onDeviceReady, false);
		},
		// deviceready Event Handler
		//
		// The scope of 'this' is the event. In order to call the 'receivedEvent'
		// function, we must explicitly call 'app.receivedEvent(...);'
		onDeviceReady: function() {
			app.receivedEvent('deviceready');
		},
		// Update DOM on a Received Event
		receivedEvent: function(id) {
			var parentElement = document.getElementById(id);
			var listeningElement = parentElement.querySelector('.listening');
			var receivedElement = parentElement.querySelector('.received');

			listeningElement.setAttribute('style', 'display:none;');
			receivedElement.setAttribute('style', 'display:block;');

			console.log('Received Event: ' + id);
		}
};
var current = "main";
var settingKeys = {	coSearch:"Search Recipes Using Only Cabinet Ingredients",
					coRandom:"Random Using Only Cabinet Ingredients"};
(setSettings = function(){
	Object.keys(settingKeys).forEach(function(x){
		if (localStorage.getItem(settingKeys[x])==null){
			localStorage.setItem(settingKeys[x],false);
		}
	});
})();
function getSetting(key){
	return localStorage.getItem(settingKeys[key]);
}
var selectedOption; //This is a DOM Element with an attribute NAME
function showLocal(){
	var counter = 0;
	while ((tmp = localStorage.key(counter++))!=null){
		alert(tmp);
	}
}
function loadSettings(){
	var counter = 0;
	var setting = document.getElementById("settings");
	setting.clear();
	while ((tmp = localStorage.key(counter++))!=null){
		setting.append(tmp + ": ");
		setting.appendObj({tag:"input",type:"checkbox",onclick:"localStorage.setItem('"+tmp+"',this.checked);"}).checked=localStorage.getItem(tmp)=="true";
		setting.newLine();
	}
}
function show (showing){	
	document.getElementById(current).style.display = "none";
	current = showing;
	document.getElementById(showing).style.display = "block";
}
var db = window.openDatabase("myDatabase.db", "1.0", "Proto DB",1000000);

HTMLDivElement.prototype.append = function(){
	if (arguments.length==1)
		arguments[1]="span";
	this.appendChild(document.createElement(arguments[1]));
	for (var i=2;i<arguments.length;i++){
		this.lastChild.appendChild(document.createElement(arguments[i]));
	}
	var element = this;
	while (element.hasChildNodes()){
		element = element.lastChild;
	}
	element.appendChild(document.createTextNode(arguments[0]));
}
HTMLDivElement.prototype.appendObj = function(){
	var obj = arguments[0];
	var element = document.createElement(obj.tag);
	function setAttr(id,val){
		if (id!=undefined && val != undefined){
			if (val.constructor === Array){
				var counter=0;
				val.forEach(function(x){
					setAttr(id,val[counter++]);
				});
			} else {
				element.setAttribute(id,((element.getAttribute(id)==null?"":element.getAttribute(id)) + " " + val).trim());
			}
		}
	}
	Object.keys(obj).forEach(function(x){
				setAttr(x,obj[x]);
			})
	this.appendChild(element);
	element.appendChild(document.createTextNode(obj.NAME));
	return element;
}
HTMLDivElement.prototype.newLine = function(){
	this.appendChild(document.createElement("br"));
}
HTMLDivElement.prototype.clear = function(){
	while (this.hasChildNodes()){
		this.removeChild(this.lastChild);
	}
}
function getRandom() {
	var element = document.getElementById('random');
	element.clear();
	var name = "";
	var instructions = "";
	var id = "";
	var ingredients = [];
	var rndSQL = "SELECT * FROM RECIPE";
	if (getSetting('coRandom')=="true")
		rndSQL = "SELECT R.* FROM INGREDIENT AS I INNER JOIN ALCOHOL AS A ON I.ALCOHOL_ID = A.ID INNER JOIN RECIPE AS R ON I.RECIPE_ID = R.ID GROUP BY R.ID HAVING COUNT(*) = SUM(A.OWNED);";
	db.transaction(function(tx) {
		tx.executeSql(rndSQL, [], function(tx,results) {
			var random = Math.floor(Math.random() * (results.rows.length - 0));
			name = results.rows[random].NAME;
			id = results.rows[random].ID;
			instructions = results.rows[random].INSTRUCTIONS;
			tx.executeSql("SELECT QUANTITY, NAME FROM INGREDIENT AS I INNER JOIN ALCOHOL AS A ON I.ALCOHOL_ID = A.ID WHERE RECIPE_ID = "+ id,[],function(tx, results) {
				var length = results.rows.length
				for (var i = 0; i < length; i++) {
					ingredients[i] = results.rows[i];
				}
				element.newLine();
				element.append(name,"h1");
				element.newLine();
				element.newLine();
				element.append("Ingredients","center","h2");
				for (var i = 0; i < ingredients.length; i++) {
					element.newLine();
					if (ingredients[i].QUANTITY != undefined && ingredients[i].QUANTITY!="") {
						element.append(ingredients[i].QUANTITY + " of ");
					}
					element.append(ingredients[i].NAME);
				}
				element.newLine();
				element.newLine();
				element.append("Instructions","center","h2");
				element.newLine();
				element.append(instructions);
			});
		});
	});
}

function getRecipeInfo(caller){
	var recipeName = caller.getAttribute("NAME");
	var element = document.getElementById('recipe');
	element.clear();
	show('recipe');
	db.transaction(function(tx){
		tx.executeSql("SELECT * FROM RECIPE WHERE LOWER(NAME) = LOWER(TRIM(?))", [recipeName], function(tx,results) {
			var name = "";
			var instructions = "";
			var id = "";
			var ingredients = [];
			name = results.rows[0].NAME;
			id = results.rows[0].ID;
			instructions = results.rows[0].INSTRUCTIONS;
			tx.executeSql("SELECT QUANTITY, NAME FROM INGREDIENT AS I INNER JOIN ALCOHOL AS A ON I.ALCOHOL_ID = A.ID WHERE RECIPE_ID = "+ id,[],function(tx, results) {
				var length = results.rows.length
				for (var i = 0; i < length; i++) {
					ingredients[i] = results.rows[i];
				}
				element.newLine();
				element.append(name,"h1");
				element.newLine();
				element.newLine();
				element.append("Ingredients","center","h2");
				for (var i = 0; i < ingredients.length; i++) {
					element.newLine();
					if (ingredients[i].QUANTITY != undefined && ingredients[i].QUANTITY!="") {
						element.append(ingredients[i].QUANTITY + " of ");
					}
					element.append(ingredients[i].NAME);
				}
				element.newLine();
				element.newLine();
				element.append("Instructions","center","h2");
				element.newLine();
				element.append(instructions);
			});
		});
	});
}

function setupModal(element){
	document.getElementById('modalName').textContent = element.getAttribute('NAME');
	document.getElementById('modalSecond').style.display = 'block';
	if (element.getAttribute('type') == 'recipe'){
		document.getElementById("modalFirst").textContent = "View Recipe";
		document.getElementById("modalFirst").setAttribute("onclick","getRecipeInfo(selectedOption)");
		document.getElementById('modalSecond').setAttribute("onclick","addAllToShopping(selectedOption)");
	} else if (element.getAttribute('type') == 'liquid'){
		document.getElementById("modalFirst").textContent = "Add to Cabinet";
		document.getElementById("modalFirst").setAttribute("onclick","addToCabinet(selectedOption)");
		document.getElementById("modalSecond").setAttribute("onclick","addToShopping(selectedOption)");
	} else if (element.getAttribute('type') == 'cabinet'){
		document.getElementById("modalFirst").textContent = "Remove from Cabinet List";
		document.getElementById("modalFirst").setAttribute("onclick","removeFromCabinet(selectedOption)");
		document.getElementById('modalSecond').style.display = 'none';
	}
}

function addToCabinet(element){
	db.transaction(function(tx) {
		tx.executeSql('UPDATE ALCOHOL SET OWNED = 1 WHERE LOWER(NAME) = LOWER(\'' + element.getAttribute("NAME")+'\')');
	});
}
function addAllToShopping(element){
	db.transaction(function(tx){
		tx.executeSql("SELECT * FROM RECIPE WHERE LOWER(NAME) = LOWER(TRIM(?))", [element.getAttribute("NAME")], function(tx,results) {
			tx.executeSql("SELECT A.ID FROM RECIPE R INNER JOIN INGREDIENT I ON R.ID = I.RECIPE_ID INNER JOIN ALCOHOL A ON I.ALCOHOL_ID=A.ID WHERE R.ID = " + results.rows[0].ID,
				[],function(tx,results){
					for (var i = 0; i < results.rows.length; i++){
						tx.executeSql('UPDATE ALCOHOL SET SHOPLIST = 1 WHERE ID = ' + results.rows[i].ID);
					}	
				});
		});
	});
}
function addToShopping(element){
	db.transaction(function(tx) {
		tx.executeSql('UPDATE ALCOHOL SET SHOPLIST = 1 WHERE LOWER(NAME) = LOWER(\'' + element.getAttribute("NAME")+'\')');
	});
}
function removeFromCabinet(element){
	db.transaction(function(tx) {
		tx.executeSql('UPDATE ALCOHOL SET OWNED = 0 WHERE LOWER(NAME) = LOWER(\'' + element.getAttribute("NAME")+'\')');
	});
	displayCabinet();
}
function removeFromShopping(element){
	db.transaction(function(tx) {
		tx.executeSql('UPDATE ALCOHOL SET SHOPLIST = 0 WHERE LOWER(NAME) = LOWER(\'' + element.getAttribute("NAME")+'\')');
	});
	displayShopping();
}
function displayCabinet(){
	var element = document.getElementById('cabinet');
	element.clear();
	db.transaction(function(tx){
		tx.executeSql('SELECT * FROM ALCOHOL WHERE OWNED = 1',[],function(tx,results){
			for (var i = 0; i < results.rows.length; i++){
				element.appendObj({	tag:'div',
									type:'cabinet',
									NAME:results.rows[i].NAME,
									class:["btn","btn-info"],
									onclick:["selectedOption = this;","setupModal(this);"],
									'data-toggle':"modal",
									'data-target':"#myModal"});
				element.newLine();
			}
		});
	});
}
function displayShopping(){
	var element = document.getElementById('shopping');
	element.clear();
	db.transaction(function(tx){
		tx.executeSql('SELECT * FROM ALCOHOL WHERE SHOPLIST = 1',[],function(tx,results){
			for (var i = 0; i < results.rows.length; i++){
				element.appendObj({ tag: 'input',
									type: 'button',
									class:['btn', 'btn-info'],
									onclick:'removeFromShopping(this)',
									NAME:results.rows[i].NAME})
				element.appendObj({	tag:'span',
									NAME:results.rows[i].NAME});
				element.newLine();
			}
		});
	});
}
function searchDrinks(text){
	var element = document.getElementById('searchOutput');
	element.clear();
	var rndSQL = 'SELECT * FROM RECIPE WHERE NAME LIKE \'%'+text+'%\' ORDER BY NAME ASC';
	if (getSetting('coSearch')=="true")
		rndSQL = 'SELECT R.* FROM INGREDIENT AS I INNER JOIN ALCOHOL AS A ON I.ALCOHOL_ID = A.ID INNER JOIN RECIPE AS R ON I.RECIPE_ID = R.ID GROUP BY R.ID HAVING COUNT(*) = SUM(A.OWNED) ORDER BY NAME ASC';
	
	db.transaction(function(tx) {
		tx.executeSql(rndSQL,[],function(tx, results){
			for (var i = 0; i < results.rows.length; i++){
				if (results.rows[i].NAME.match('.*'+text+'.*')==undefined)
					continue;
				element.appendObj({	tag:'button',
									type:'recipe',
									NAME:results.rows[i].NAME,
									onclick:["selectedOption = this;","setupModal(this);"],
									class:["btn","btn-info"],
									'data-toggle':"modal",
									'data-target':"#myModal"});
				element.newLine();
			}
		});
	});
}
function searchIngredients(text){
	var element = document.getElementById('searchOutput');
	element.clear();
	db.transaction(function(tx) {
		tx.executeSql('SELECT * FROM ALCOHOL WHERE NAME LIKE \'%'+text+'%\' ORDER BY NAME ASC',[],function(tx,results){
			for (var i = 0; i < results.rows.length; i++){
				element.appendObj({	tag:'button',
									type:'liquid',
									NAME:results.rows[i].NAME,
									onclick:["selectedOption = this;","setupModal(this);"],
									class:["btn","btn-info"],
									'data-toggle':"modal",
									'data-target':"#myModal"});
				element.newLine();
			}
		});
	});
}