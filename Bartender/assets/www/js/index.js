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
var selectedOption; //This is a DOM Element with an attribute NAME

function show (showing){	
	document.getElementById(current).style.display = "none";
	current = showing;
	document.getElementById(showing).style.display = "block";
}
var db = window.openDatabase("myDatabase.db", "1.0", "Proto DB",
		1000000);

function append(element, text) {
	element.appendChild(document.createElement("br"));
	element.appendChild(document.createTextNode(text));
}
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
	db.transaction(function(tx) {
		tx.executeSql('SELECT * FROM RECIPE', [], function(tx,results) {
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
	} else if (element.getAttribute('type') == 'liquid'){
		document.getElementById("modalFirst").textContent = "Add to Cabinet";
		document.getElementById("modalFirst").setAttribute("onclick","addToCabinet(selectedOption)");
	} else if (element.getAttribute('type') == 'cabinet'){
		document.getElementById("modalFirst").textContent = "Remove from Shopping List";
		document.getElementById("modalFirst").setAttribute("onclick","removeFromCabinet(selectedOption)");
		document.getElementById('modalSecond').style.display = 'none';
	}
}

function addToCabinet(element){
	db.transaction(function(tx) {
		tx.executeSql('UPDATE ALCOHOL SET OWNED = 1 WHERE LOWER(NAME) = LOWER(\'' + element.getAttribute("NAME")+'\')');
	});
}
function removeFromCabinet(element){
	db.transaction(function(tx) {
		tx.executeSql('DELETE FROM ALCOHOL WHERE LOWER(NAME) = LOWER(\'' + element.getAttribute("NAME")+'\')');
	});
	displayCabinet();
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
function search(text){
	var element = document.getElementById('searchOutput');
	element.clear();
	db.transaction(function(tx) {
		tx.executeSql('SELECT * FROM RECIPE WHERE NAME LIKE \'%'+text+'%\'',[],function(tx, results){
			for (var i = 0; i < results.rows.length; i++){
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
		tx.executeSql('SELECT * FROM ALCOHOL WHERE NAME LIKE \'%'+text+'%\'',[],function(tx,results){
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