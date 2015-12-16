"use strict";angular.module("stockDogApp",["ngAnimate","ngCookies","ngResource","ngRoute","ngSanitize","ngTouch","mgcrea.ngStrap","googlechart"]).config(["$routeProvider",function(a){a.when("/dashboard",{templateUrl:"views/dashboard.html",controller:"DashboardCtrl"}).when("/watchlist/:listId",{templateUrl:"views/watchlist.html",controller:"WatchlistCtrl"}).otherwise({redirectTo:"/dashboard"})}]),angular.module("stockDogApp").service("WatchlistService",function(){var a={save:function(){var a=e(this.listId);a.recalculate(),d()}},b={addStock:function(b){var c=_.find(this.stocks,function(a){return a.company.symbol===b.company.symbol});c?c.shares+=b.shares:(_.extend(b,a),this.stocks.push(b)),this.recalculate(),d()},removeStock:function(a){_.remove(this.stocks,function(b){return b.company.symbol===a.company.symbol}),this.recalculate(),d()},recalculate:function(){var a=_.reduce(this.stocks,function(a,b){return a.shares+=b.shares,a.marketValue+=b.marketValue,a.dayChange+=b.dayChange,a},{shares:0,marketValue:0,dayChange:0});this.shares=a.shares,this.marketValue=a.marketValue,this.dayChange=a.dayChange}},c=function(){var c={watchlists:localStorage["StockDog.watchlists"]?JSON.parse(localStorage["StockDog.watchlists"]):[],nextId:localStorage["StockDog.nextId"]?parseInt(localStorage["StockDog.nextId"]):0};return _.each(c.watchlists,function(c){_.extend(c,b),_.each(c.stocks,function(b){_.extend(b,a)})}),c},d=function(){localStorage["StockDog.watchlists"]=JSON.stringify(f.watchlists),localStorage["StockDog.nextId"]=f.nextId},e=function(a){return _.find(f.watchlists,function(b){return b.id===parseInt(a)})};this.query=function(a){return a?e(a):f.watchlists},this.save=function(a){a.id=f.nextId++,a.stocks=[],_.extend(a,b),f.watchlists.push(a),d()},this.remove=function(a){_.remove(f.watchlists,function(b){return b.id===a.id}),d()};var f=c()}),angular.module("stockDogApp").directive("stkWatchlistPanel",["$location","$modal","$routeParams","WatchlistService",function(a,b,c,d){return{templateUrl:"views/templates/watchlist-panel.html",restrict:"E",scope:{},link:function(e){e.watchlist={};var f=b({scope:e,template:"views/templates/addlist-modal.html",show:!1});e.watchlists=d.query(),e.showModal=function(){f.$promise.then(f.show)},e.createList=function(){d.save(e.watchlist),f.hide(),e.watchlist={}},e.deleteList=function(b){d.remove(b),a.path("/")},e.currentList=c.listId,e.gotoList=function(b){a.path("watchlist/"+b)}}}}]),angular.module("stockDogApp").controller("DashboardCtrl",["$scope","WatchlistService","QuoteService",function(a,b,c){var d=[];a.watchlists=b.query(),a.cssStyle="height:300px;";var e={number:[{columnNum:1,prefix:"$"}]},f=function(){var b={type:"PieChart",displayed:!0,data:[["Watchlist","Market Value"]],options:{title:"Market Value by Watchlist",legend:"none",pieHole:.4},formatters:e},c={type:"ColumnChart",displayed:!0,data:[["Watchlist","Change",{role:"style"}]],options:{title:"Day Change by Watchlist",legend:"none",animation:{duration:1500,easing:"linear"}},formatters:e};_.each(a.watchlists,function(a){b.data.push([a.name,a.marketValue]),c.data.push([a.name,a.dayChange,a.dayChange<0?"Red":"Green"])}),a.donutChart=b,a.columnChart=c},g=function(){c.clear(),_.each(a.watchlists,function(a){_.each(a.stocks,function(a){c.register(a)})}),_.each(d,function(a){a()}),_.each(a.watchlists,function(b){var c=a.$watch(function(){return b.marketValue},function(){h()});d.push(c)})},h=function(){a.marketValue=0,a.dayChange=0,_.each(a.watchlists,function(b){a.marketValue+=b.marketValue?b.marketValue:0,a.dayChange+=b.dayChange?b.dayChange:0}),f()};a.$watch("watchlists.length",function(){g()})}]),angular.module("stockDogApp").controller("WatchlistCtrl",["$scope","$routeParams","$modal","WatchlistService","CompanyService",function(a,b,c,d,e){a.companies=e.query(),a.watchlist=d.query(b.listId),a.stocks=a.watchlist.stocks,a.newStock={};var f=c({scope:a,template:"views/templates/addstock-modal.html",show:!1});a.showStockModal=function(){f.$promise.then(f.show)},a.addStock=function(){a.watchlist.addStock({listId:b.listId,company:a.newStock.company,shares:a.newStock.shares}),f.hide(),a.newStock={}}}]),angular.module("stockDogApp").controller("MainCtrl",["$scope","$location","WatchlistService",function(a,b,c){a.watchlists=c.query(),a.$watch(function(){return b.path()},function(b){_.contains(b,"watchlist")?a.activeView="watchlist":a.activeView="dashboard"})}]),angular.module("stockDogApp").service("CompanyService",["$resource",function(a){return a("companies.json")}]),angular.module("stockDogApp").service("QuoteService",["$http","$interval",function(a,b){var c=[],d="http://query.yahooapis.com/v1/public/yql",e=function(a){console.log(a),a.length===c.length&&_.each(a,function(a,b){var d=c[b];d.lastPrice=parseFloat(a.LastTradePriceOnly),d.change=a.Change,d.percentChange=a.ChangeinPercent,d.marketValue=d.shares*d.lastPrice,d.dayChange=d.shares*parseFloat(d.change),d.save()})};this.register=function(a){c.push(a)},this.deregister=function(a){_.remove(c,a)},this.clear=function(){c=[]},this.fetch=function(){var b=_.reduce(c,function(a,b){return a.push(b.company.symbol),a},[]),f=encodeURIComponent("select * from yahoo.finance.quotes where symbol in ('"+b.join(",")+"')"),g=d+"?q="+f+"&format=json&diagnostics=true&env=http://datatables.org/alltables.env";a.jsonp(g+"&callback=JSON_CALLBACK").success(function(a){if(a.query.count){var b=a.query.count>1?a.query.results.quote:[a.query.results.quote];e(b)}}).error(function(a){console.log(a)})},b(this.fetch,5e3)}]),angular.module("stockDogApp").directive("stkStockTable",function(){return{templateUrl:"views/templates/stock-table.html",restrict:"E",scope:{watchlist:"="},controller:["$scope",function(a){var b=[];a.$watch("showPercent",function(a){a&&_.each(b,function(b){b.showPercent=a})}),this.addRow=function(a){b.push(a)},this.removeRow=function(a){_.remove(b,a)}}],link:function(a){a.showPercent=!1,a.removeStock=function(b){a.watchlist.removeStock(b)}}}}),angular.module("stockDogApp").directive("stkStockRow",["$timeout","QuoteService",function(a,b){return{restrict:"A",require:"^stkStockTable",scope:{stock:"=",isLast:"="},link:function(c,d,e,f){d.tooltip({placement:"left",title:c.stock.company.name}),f.addRow(c),b.register(c.stock),c.$on("$destroy",function(){f.removeRow(c),b.deregister(c.stock)}),c.isLast&&a(b.fetch),c.$watch("stock.shares",function(){c.stock.marketValue=c.stock.shares*c.stock.lastPrice,c.stock.dayChange=c.stock.shares*parseFloat(c.stock.change),c.stock.save()})}}}]);var NUMBER_REGEXP=/^\s*(\-|\+)?(\d+|(\d*(\.\d*)))\s*$/;angular.module("stockDogApp").directive("contenteditable",["$sce",function(a){return{restrict:"A",require:"ngModel",link:function(b,c,d,e){if(e){e.$render=function(){c.html(a.getTrustedHtml(e.$viewValue||""))};var f=function(){var a=c.html();"number"!==d.type||NUMBER_REGEXP.test(a)?e.$setViewValue(a):e.$render()};"number"===d.type&&e.$parsers.push(function(a){return parseFloat(a)}),c.on("blur keyup change",function(){b.$apply(f)})}}}}]),angular.module("stockDogApp").directive("stkSignColor",function(){return{restrict:"A",link:function(a,b,c){c.$observe("stkSignColor",function(a){var c=parseFloat(a);c>0?b[0].style.color="Green":b[0].style.color="Red"})}}}),angular.module("stockDogApp").directive("stkSignFade",["$animate",function(a){return{restrict:"A",link:function(b,c,d){var e=null;d.$observe("stkSignFade",function(b){if(!e||e!==b){var d=parseFloat(e),f=parseFloat(b);if(e=b,d&&f){var g=f-d>=0?"up":"down";a.addClass(c,"change-"+g,function(){a.removeClass(c,"change-"+g)})}}})}}}]);