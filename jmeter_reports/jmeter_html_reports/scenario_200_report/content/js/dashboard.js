/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 99.99471216554447, "KoPercent": 0.005287834455529312};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.987621647878595, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.9974279835390947, 500, 1500, "037 /api/issues/TICKET"], "isController": false}, {"data": [0.998467824310521, 500, 1500, "029 /api/savedQueries"], "isController": false}, {"data": [0.9920212765957447, 500, 1500, "HTTP Change field issue status - POST TICKET"], "isController": false}, {"data": [1.0, 500, 1500, "GET - Remote Module: static/current_name.js?remote_hash"], "isController": false}, {"data": [0.9959141981613892, 500, 1500, "027 /api/admin/projects/DEMO"], "isController": false}, {"data": [0.995049504950495, 500, 1500, "HTTP Create comment to random issue"], "isController": false}, {"data": [0.46852425180598556, 500, 1500, "Transaction - Read ISSUE - /projects/DEMO/issues/TICKET/NEWSUMMARY"], "isController": true}, {"data": [0.9974200206398349, 500, 1500, "040 /api/issueListSubscription"], "isController": false}, {"data": [0.8793103448275862, 500, 1500, "Transaction - Create ISSUE"], "isController": true}, {"data": [0.9956521739130435, 500, 1500, "001 /projects/DEMO/issues/TICKET/NEWSUMMARY"], "isController": false}, {"data": [0.9969849246231156, 500, 1500, "017 /api/admin/globalSettings"], "isController": false}, {"data": [0.9947916666666666, 500, 1500, "HTTP Change field - GET issue types TICKET"], "isController": false}, {"data": [0.9974306269270298, 500, 1500, "033 /api/issues/TICKET"], "isController": false}, {"data": [0.9994979919678715, 500, 1500, "016 /api/users/me/profiles/grazie"], "isController": false}, {"data": [0.8793103448275862, 500, 1500, "HTTP Create ticket"], "isController": false}, {"data": [0.94400396432111, 500, 1500, "Transaction - Search ISSUE"], "isController": true}, {"data": [0.9894736842105263, 500, 1500, "Transaction change priority"], "isController": true}, {"data": [0.9985207100591716, 500, 1500, "005 /hub/api/rest/users/me"], "isController": false}, {"data": [0.9984662576687117, 500, 1500, "030 /api/users/me/profiles/appearance"], "isController": false}, {"data": [0.9867021276595744, 500, 1500, "Transaction Controller"], "isController": true}, {"data": [1.0, 500, 1500, "JSR223 gen random num of issue"], "isController": false}, {"data": [1.0, 500, 1500, "001 /projects/DEMO/issues/TICKET/NEWSUMMARY-9"], "isController": false}, {"data": [1.0, 500, 1500, "001 /projects/DEMO/issues/TICKET/NEWSUMMARY-8"], "isController": false}, {"data": [1.0, 500, 1500, "001 /projects/DEMO/issues/TICKET/NEWSUMMARY-7"], "isController": false}, {"data": [0.9984879032258065, 500, 1500, "018 /api/admin/widgets/general"], "isController": false}, {"data": [1.0, 500, 1500, "001 /projects/DEMO/issues/TICKET/NEWSUMMARY-6"], "isController": false}, {"data": [1.0, 500, 1500, "001 /projects/DEMO/issues/TICKET/NEWSUMMARY-5"], "isController": false}, {"data": [1.0, 500, 1500, "JSR223 Set search word"], "isController": false}, {"data": [1.0, 500, 1500, "001 /projects/DEMO/issues/TICKET/NEWSUMMARY-4"], "isController": false}, {"data": [0.9973118279569892, 500, 1500, "HTTP Change field issue priority - POST TICKET"], "isController": false}, {"data": [1.0, 500, 1500, "001 /projects/DEMO/issues/TICKET/NEWSUMMARY-3"], "isController": false}, {"data": [0.9984984984984985, 500, 1500, "014 /api/admin/timeTrackingSettings/workTimeSettings"], "isController": false}, {"data": [1.0, 500, 1500, "001 /projects/DEMO/issues/TICKET/NEWSUMMARY-2"], "isController": false}, {"data": [1.0, 500, 1500, "001 /projects/DEMO/issues/TICKET/NEWSUMMARY-15"], "isController": false}, {"data": [0.9980487804878049, 500, 1500, "0012 dynamic vendor.js"], "isController": false}, {"data": [0.9969135802469136, 500, 1500, "034 /api/issues/TICKET/sprints"], "isController": false}, {"data": [1.0, 500, 1500, "001 /projects/DEMO/issues/TICKET/NEWSUMMARY-13"], "isController": false}, {"data": [1.0, 500, 1500, "001 /projects/DEMO/issues/TICKET/NEWSUMMARY-14"], "isController": false}, {"data": [1.0, 500, 1500, "001 /projects/DEMO/issues/TICKET/NEWSUMMARY-11"], "isController": false}, {"data": [1.0, 500, 1500, "001 /projects/DEMO/issues/TICKET/NEWSUMMARY-12"], "isController": false}, {"data": [1.0, 500, 1500, "001 /projects/DEMO/issues/TICKET/NEWSUMMARY-10"], "isController": false}, {"data": [0.9984567901234568, 500, 1500, "035 /api/issues/TICKET/watchers/issueWatchers"], "isController": false}, {"data": [0.9982698961937716, 500, 1500, "HTTP search - GET fields"], "isController": false}, {"data": [1.0, 500, 1500, "001 /projects/DEMO/issues/TICKET/NEWSUMMARY-1"], "isController": false}, {"data": [0.9984243697478992, 500, 1500, "Debug Sampler -end"], "isController": false}, {"data": [0.9956521739130435, 500, 1500, "001 /projects/DEMO/issues/TICKET/NEWSUMMARY-0"], "isController": false}, {"data": [0.9973404255319149, 500, 1500, "HTTP Change field - GET status types TICKET"], "isController": false}, {"data": [0.9975296442687747, 500, 1500, "006 /api/permissions/cache"], "isController": false}, {"data": [1.0, 500, 1500, "007 /youtrack/features/features-en_US.json"], "isController": false}, {"data": [0.999507874015748, 500, 1500, "003 /api/users/me"], "isController": false}, {"data": [0.9965483234714004, 500, 1500, "HTTP search POST - resent search"], "isController": false}, {"data": [0.9958720330237358, 500, 1500, "039 /api/issuesGetter"], "isController": false}, {"data": [0.9964102564102564, 500, 1500, "032 /api/issues/TICKET/sseSubscription"], "isController": false}, {"data": [0.9966183574879227, 500, 1500, "0011 dynamic fast-loader"], "isController": false}, {"data": [0.9921052631578947, 500, 1500, "HTTP Change field - GET priority types TICKET"], "isController": false}, {"data": [0.9947916666666666, 500, 1500, "HTTP Change field issue type - POST TICKET"], "isController": false}, {"data": [0.9960435212660732, 500, 1500, "HTTP search - GET sorted Issues"], "isController": false}, {"data": [0.9990224828934506, 500, 1500, "0013 dynamic index.js"], "isController": false}, {"data": [0.9970059880239521, 500, 1500, "013 /api/users/me"], "isController": false}, {"data": [0.9919354838709677, 500, 1500, "HTTP add random link - POST TICKET"], "isController": false}, {"data": [0.9826560951437067, 500, 1500, "HTTP search POST - issuesGetter"], "isController": false}, {"data": [0.9974437627811861, 500, 1500, "031 /api/users/me/recent/issues"], "isController": false}, {"data": [0.9969135802469136, 500, 1500, "036 /api/issues/TICKET/links"], "isController": false}, {"data": [0.9975393700787402, 500, 1500, "004 /hub/api/rest/settings/public"], "isController": false}, {"data": [0.9979695431472081, 500, 1500, "023 /api/issueLinkTypes"], "isController": false}, {"data": [0.998991935483871, 500, 1500, "019 /api/permissions/cache"], "isController": false}, {"data": [0.9949135300101729, 500, 1500, "024 /api/issues/TICKET"], "isController": false}, {"data": [0.9990176817288802, 500, 1500, "002 /hub/api/rest/users/me"], "isController": false}, {"data": [0.9869791666666666, 500, 1500, "Transaction Change issue type"], "isController": true}, {"data": [1.0, 500, 1500, "009 /api/config"], "isController": false}, {"data": [0.9985044865403788, 500, 1500, "012 /hub/api/rest/avatar/USER_ID"], "isController": false}, {"data": [0.9969635627530364, 500, 1500, "021 /api/users/me/recent/issues"], "isController": false}, {"data": [0.9965277777777778, 500, 1500, "008 /api/inbox/folders"], "isController": false}, {"data": [1.0, 500, 1500, "010 /youtrack/features/features-en_US.json"], "isController": false}, {"data": [0.9917695473251029, 500, 1500, "038 /api/issues/TICKET/activitiesPage"], "isController": false}, {"data": [0.9989868287740629, 500, 1500, "022 /api/users/me/recent/articles"], "isController": false}, {"data": [0.9980340760157274, 500, 1500, "HTTP Change field - GET TICKET"], "isController": false}, {"data": [0.9978102189781022, 500, 1500, "GET - Chunk"], "isController": false}, {"data": [0.995, 500, 1500, "011 /api/config"], "isController": false}, {"data": [1.0, 500, 1500, "015 /api/config"], "isController": false}, {"data": [0.9974721941354904, 500, 1500, "020 /api/users/me/profiles/questionnaire"], "isController": false}, {"data": [0.9985089463220675, 500, 1500, "HTTP search POST - count fields"], "isController": false}, {"data": [0.9984771573604061, 500, 1500, "025 /hub/api/rest/avatar/current_id"], "isController": false}, {"data": [0.9945598417408507, 500, 1500, "HTTP search POST - fields"], "isController": false}, {"data": [0.9893617021276596, 500, 1500, "Transaction add comment random issue"], "isController": true}, {"data": [0.9969356486210419, 500, 1500, "028 /api/tags"], "isController": false}, {"data": [0.995049504950495, 500, 1500, "Transaction ADD comment"], "isController": true}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 56734, 3, 0.005287834455529312, 26.888250431839992, 0, 2303, 7.0, 68.0, 120.0, 334.9900000000016, 15.77679453599111, 701.0293509128337, 19.928971182736095], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["037 /api/issues/TICKET", 972, 0, 0.0, 25.127572016460906, 4, 916, 17.0, 27.0, 39.0, 288.7999999999993, 0.29253238848180807, 7.897789617033872, 0.7002093162160755], "isController": false}, {"data": ["029 /api/savedQueries", 979, 0, 0.0, 13.889683350357519, 5, 647, 8.0, 12.0, 21.0, 244.80000000000064, 0.2902700816343836, 1.7423440686874188, 0.33140723487801094], "isController": false}, {"data": ["HTTP Change field issue status - POST TICKET", 188, 0, 0.0, 41.70744680851066, 6, 869, 27.0, 48.39999999999998, 73.09999999999997, 788.0099999999986, 0.05756599344053877, 0.0874368448614849, 0.028475299500094465], "isController": false}, {"data": ["GET - Remote Module: static/current_name.js?remote_hash", 200, 0, 0.0, 16.22999999999999, 11, 51, 16.0, 19.0, 20.94999999999999, 34.0, 0.5933872920177542, 64.66917244539353, 0.4427225499038713], "isController": false}, {"data": ["027 /api/admin/projects/DEMO", 979, 0, 0.0, 14.52196118488254, 4, 704, 6.0, 10.0, 16.0, 361.4000000000003, 0.28985378519732413, 0.39736062166827285, 0.35782267282420915], "isController": false}, {"data": ["HTTP Create comment to random issue", 202, 0, 0.0, 73.06435643564353, 30, 1187, 53.0, 109.40000000000003, 132.85, 694.8999999999996, 0.06155070605058676, 0.05262822228991784, 0.036417183677362165], "isController": false}, {"data": ["Transaction - Read ISSUE - /projects/DEMO/issues/TICKET/NEWSUMMARY", 969, 0, 0.0, 911.6284829721359, 466, 3986, 765.0, 1390.0, 1566.5, 2132.1999999999994, 0.2895495040008032, 350.63517418716594, 15.323987060439052], "isController": true}, {"data": ["040 /api/issueListSubscription", 969, 0, 0.0, 11.360165118679058, 2, 771, 5.0, 8.0, 14.0, 292.3999999999969, 0.29240013132356774, 0.21282092206299305, 0.20332685255776184], "isController": false}, {"data": ["Transaction - Create ISSUE", 29, 3, 10.344827586206897, 184.55172413793102, 5, 1300, 149.0, 268.0, 793.5, 1300.0, 0.008982936447583172, 0.005786758292102172, 0.011143366542836371], "isController": true}, {"data": ["001 /projects/DEMO/issues/TICKET/NEWSUMMARY", 1035, 0, 0.0, 20.832850241545906, 2, 718, 5.0, 81.0, 89.0, 433.3600000000099, 0.2909932936589047, 51.2914171119485, 0.5049218523979394], "isController": false}, {"data": ["017 /api/admin/globalSettings", 995, 0, 0.0, 10.835175879396996, 2, 733, 5.0, 8.0, 13.0, 263.03999999999996, 0.28843898848650124, 0.25296275941028573, 0.20256067328617236], "isController": false}, {"data": ["HTTP Change field - GET issue types TICKET", 192, 0, 0.0, 21.619791666666654, 4, 599, 7.0, 17.400000000000034, 41.89999999999992, 562.7299999999998, 0.059069580273713666, 0.11943647524276982, 0.025853757332934615], "isController": false}, {"data": ["033 /api/issues/TICKET", 973, 0, 0.0, 12.392600205549849, 4, 687, 7.0, 12.0, 20.0, 148.7199999999998, 0.2906476573739073, 0.199634444013883, 0.9573935327461036], "isController": false}, {"data": ["016 /api/users/me/profiles/grazie", 996, 0, 0.0, 9.369477911646582, 3, 757, 6.0, 9.0, 15.0, 46.02999999999997, 0.28835848170573886, 0.2631106030658644, 0.20503878580813042], "isController": false}, {"data": ["HTTP Create ticket", 29, 3, 10.344827586206897, 184.55172413793102, 5, 1300, 149.0, 268.0, 793.5, 1300.0, 0.008999171145305893, 0.005797216595154288, 0.01116350574659141], "isController": false}, {"data": ["Transaction - Search ISSUE", 1009, 0, 0.0, 375.9127849355798, 209, 2384, 302.0, 542.0, 911.0, 1225.4999999999995, 0.28247322243436485, 237.38141584847298, 4.661430684266185], "isController": true}, {"data": ["Transaction change priority", 190, 0, 0.0, 74.0052631578947, 11, 1482, 43.0, 72.70000000000002, 303.2999999999996, 857.7400000000023, 0.058328746340254915, 0.263195576535911, 0.07245314100682784], "isController": true}, {"data": ["005 /hub/api/rest/users/me", 1014, 0, 0.0, 9.585798816568042, 2, 672, 5.0, 8.0, 10.0, 63.35000000000025, 0.2889998780158306, 0.11317280379330866, 0.18150778596737435], "isController": false}, {"data": ["030 /api/users/me/profiles/appearance", 978, 0, 0.0, 10.04498977505112, 3, 675, 5.0, 8.0, 12.0, 101.33000000000266, 0.2901671606134573, 0.20525373391804885, 0.18110645737643197], "isController": false}, {"data": ["Transaction Controller", 188, 0, 0.0, 66.82978723404256, 18, 880, 42.0, 80.1, 212.84999999999954, 801.6799999999987, 0.05749024500629946, 0.24349438533601214, 0.07207095276702384], "isController": true}, {"data": ["JSR223 gen random num of issue", 1049, 0, 0.0, 0.28884652049571, 0, 31, 0.0, 1.0, 1.0, 1.0, 0.29180876928469296, 0.0, 0.0], "isController": false}, {"data": ["001 /projects/DEMO/issues/TICKET/NEWSUMMARY-9", 100, 0, 0.0, 3.5000000000000013, 1, 26, 3.0, 4.0, 5.0, 25.969999999999985, 0.3164436793539486, 0.8448799017125932, 0.22188140798450692], "isController": false}, {"data": ["001 /projects/DEMO/issues/TICKET/NEWSUMMARY-8", 100, 0, 0.0, 3.490000000000001, 2, 23, 3.0, 4.0, 4.0, 22.819999999999908, 0.31644267799109527, 0.35970632537269037, 0.22188070585703754], "isController": false}, {"data": ["001 /projects/DEMO/issues/TICKET/NEWSUMMARY-7", 100, 0, 0.0, 3.96, 2, 26, 3.0, 4.0, 5.0, 25.97999999999999, 0.31644267799109527, 0.38968185248708126, 0.22188070585703754], "isController": false}, {"data": ["018 /api/admin/widgets/general", 992, 0, 0.0, 12.326612903225797, 5, 653, 8.0, 11.0, 17.34999999999991, 171.57999999999402, 0.2879393469698157, 2.579179805532093, 0.22780080518523033], "isController": false}, {"data": ["001 /projects/DEMO/issues/TICKET/NEWSUMMARY-6", 100, 0, 0.0, 6.5299999999999985, 2, 25, 6.0, 10.900000000000006, 12.0, 24.89999999999995, 0.3164436793539486, 0.5667555741554118, 0.22188140798450692], "isController": false}, {"data": ["001 /projects/DEMO/issues/TICKET/NEWSUMMARY-5", 100, 0, 0.0, 6.560000000000002, 2, 28, 6.0, 11.0, 13.0, 27.869999999999933, 0.31643967394055994, 0.37268188161358917, 0.22187859950129107], "isController": false}, {"data": ["JSR223 Set search word", 1015, 0, 0.0, 0.25911330049261105, 0, 60, 0.0, 1.0, 1.0, 1.0, 0.28277690824265433, 0.0, 0.0], "isController": false}, {"data": ["001 /projects/DEMO/issues/TICKET/NEWSUMMARY-4", 100, 0, 0.0, 5.1999999999999975, 2, 23, 3.0, 10.900000000000006, 12.0, 22.909999999999954, 0.31644067528440106, 0.2116815064158347, 0.22187930161542965], "isController": false}, {"data": ["HTTP Change field issue priority - POST TICKET", 186, 0, 0.0, 33.61290322580645, 5, 652, 28.0, 44.50000000000006, 53.30000000000001, 429.27999999999884, 0.05708401939015239, 0.08669329740390473, 0.028209031570378303], "isController": false}, {"data": ["001 /projects/DEMO/issues/TICKET/NEWSUMMARY-3", 100, 0, 0.0, 12.39, 8, 32, 12.0, 15.0, 16.94999999999999, 31.95999999999998, 0.3164296608506895, 45.93584356488865, 0.22248960528564105], "isController": false}, {"data": ["014 /api/admin/timeTrackingSettings/workTimeSettings", 999, 0, 0.0, 10.960960960960955, 3, 737, 5.0, 9.0, 15.0, 211.0, 0.2886470687153385, 0.22531957631363309, 0.18466622401670743], "isController": false}, {"data": ["001 /projects/DEMO/issues/TICKET/NEWSUMMARY-2", 100, 0, 0.0, 6.929999999999999, 2, 27, 6.0, 11.0, 12.949999999999989, 26.989999999999995, 0.31643967394055994, 0.36557434987468984, 0.23949291728899802], "isController": false}, {"data": ["001 /projects/DEMO/issues/TICKET/NEWSUMMARY-15", 100, 0, 0.0, 40.35000000000001, 32, 55, 39.0, 49.900000000000006, 51.94999999999999, 54.989999999999995, 0.316408635424478, 144.05601597131914, 0.22185683616677265], "isController": false}, {"data": ["0012 dynamic vendor.js", 1025, 0, 0.0, 91.40682926829277, 64, 790, 80.0, 111.0, 138.69999999999993, 297.5400000000002, 0.2899986674207575, 99.79324260975531, 0.11586518785972214], "isController": false}, {"data": ["034 /api/issues/TICKET/sprints", 972, 0, 0.0, 14.507201646090524, 4, 705, 7.0, 11.0, 18.0, 373.5899999999997, 0.29206370955165517, 0.1861335124589811, 0.18540902234227283], "isController": false}, {"data": ["001 /projects/DEMO/issues/TICKET/NEWSUMMARY-13", 100, 0, 0.0, 12.680000000000007, 10, 17, 13.0, 14.900000000000006, 15.0, 16.989999999999995, 0.3164346673164125, 25.80991020474114, 0.2237291983760573], "isController": false}, {"data": ["001 /projects/DEMO/issues/TICKET/NEWSUMMARY-14", 100, 0, 0.0, 74.27999999999997, 63, 135, 72.0, 85.80000000000001, 89.94999999999999, 134.85999999999993, 0.3163725983365129, 341.3617947066118, 0.2221405255897976], "isController": false}, {"data": ["001 /projects/DEMO/issues/TICKET/NEWSUMMARY-11", 100, 0, 0.0, 3.0000000000000013, 2, 6, 3.0, 4.900000000000006, 5.0, 5.989999999999995, 0.31644267799109527, 0.22311681006794026, 0.22188070585703754], "isController": false}, {"data": ["001 /projects/DEMO/issues/TICKET/NEWSUMMARY-12", 100, 0, 0.0, 3.3299999999999996, 2, 8, 3.0, 5.0, 5.949999999999989, 7.97999999999999, 0.31644267799109527, 0.42645595276143705, 0.22188070585703754], "isController": false}, {"data": ["001 /projects/DEMO/issues/TICKET/NEWSUMMARY-10", 100, 0, 0.0, 3.119999999999999, 2, 7, 3.0, 4.0, 5.0, 6.97999999999999, 0.31644167663457945, 0.35476078591454807, 0.2218800037340118], "isController": false}, {"data": ["035 /api/issues/TICKET/watchers/issueWatchers", 972, 0, 0.0, 9.744855967078186, 3, 750, 6.0, 9.700000000000045, 15.0, 50.01999999999953, 0.29180391257410676, 0.5306445448767099, 0.17327557716081998], "isController": false}, {"data": ["HTTP search - GET fields", 2023, 0, 0.0, 9.990113692535848, 2, 732, 5.0, 8.0, 12.799999999999955, 186.07999999999993, 0.565437434194179, 0.4102734507873779, 0.19554309114345536], "isController": false}, {"data": ["001 /projects/DEMO/issues/TICKET/NEWSUMMARY-1", 100, 0, 0.0, 6.010000000000001, 2, 30, 5.0, 10.0, 11.949999999999989, 29.829999999999913, 0.31644167663457945, 1.822938916472055, 0.24042150822431918], "isController": false}, {"data": ["Debug Sampler -end", 952, 0, 0.0, 131.59873949579813, 76, 643, 111.0, 199.4000000000001, 264.74999999999955, 430.6400000000003, 0.2906245497151147, 82.95963434262909, 0.0], "isController": false}, {"data": ["001 /projects/DEMO/issues/TICKET/NEWSUMMARY-0", 1035, 0, 0.0, 12.640579710144925, 2, 718, 5.0, 8.0, 12.0, 433.3600000000099, 0.2909932936589047, 1.2526351937973164, 0.20575755139897486], "isController": false}, {"data": ["HTTP Change field - GET status types TICKET", 188, 0, 0.0, 16.797872340425542, 4, 753, 7.0, 21.099999999999994, 32.54999999999998, 425.47999999999456, 0.05749518554277443, 0.06885672065964105, 0.02515922085536933], "isController": false}, {"data": ["006 /api/permissions/cache", 1012, 0, 0.0, 11.806324110671925, 2, 690, 5.0, 8.0, 12.0, 389.8000000000011, 0.2887204179256579, 1.861427135824983, 0.17174647822428954], "isController": false}, {"data": ["007 /youtrack/features/features-en_US.json", 510, 0, 0.0, 44.99411764705878, 33, 170, 41.0, 53.0, 62.0, 147.77999999999997, 0.14607425441265978, 0.22318531604668648, 0.11301119276073181], "isController": false}, {"data": ["003 /api/users/me", 1016, 0, 0.0, 9.272637795275594, 3, 617, 6.0, 9.0, 13.0, 49.320000000000164, 0.28862504822254126, 0.9767389401708115, 0.2601937676164969], "isController": false}, {"data": ["HTTP search POST - resent search", 1014, 0, 0.0, 14.613412228796836, 4, 718, 7.0, 11.0, 20.0, 415.1000000000006, 0.2827629228093473, 0.1682635681236951, 0.1000368172174734], "isController": false}, {"data": ["039 /api/issuesGetter", 969, 0, 0.0, 19.72445820433434, 10, 811, 13.0, 18.0, 24.0, 102.89999999999623, 0.2917483978677377, 2.499476105666964, 0.6855121182657379], "isController": false}, {"data": ["032 /api/issues/TICKET/sseSubscription", 975, 0, 0.0, 13.948717948717944, 3, 753, 5.0, 8.0, 14.199999999999932, 397.20000000000005, 0.2908738985575042, 0.208869542739519, 0.180675401454459], "isController": false}, {"data": ["0011 dynamic fast-loader", 1035, 0, 0.0, 22.253140096618345, 10, 797, 14.0, 23.0, 31.0, 382.1600000000119, 0.2909857670005272, 7.450826963626779, 0.11768170137058513], "isController": false}, {"data": ["HTTP Change field - GET priority types TICKET", 190, 0, 0.0, 24.078947368421083, 4, 765, 7.0, 11.0, 28.799999999999955, 644.8800000000005, 0.0580955543447219, 0.08754524669054088, 0.02540515963817477], "isController": false}, {"data": ["HTTP Change field issue type - POST TICKET", 192, 0, 0.0, 38.65625000000001, 7, 648, 29.0, 43.0, 58.349999999999994, 604.2899999999997, 0.05922038217503509, 0.08995770272879501, 0.029482176650544534], "isController": false}, {"data": ["HTTP search - GET sorted Issues", 1011, 0, 0.0, 58.47972304648867, 4, 1100, 30.0, 147.80000000000007, 187.39999999999998, 330.9599999999999, 0.28271203332590433, 8.414001484727537, 0.46318459839161735], "isController": false}, {"data": ["0013 dynamic index.js", 1023, 0, 0.0, 52.25024437927657, 34, 743, 43.0, 69.0, 87.79999999999995, 231.55999999999995, 0.2898076108067927, 37.27820203149328, 0.1155053547657346], "isController": false}, {"data": ["013 /api/users/me", 1002, 0, 0.0, 16.263473053892245, 6, 728, 10.0, 14.0, 21.0, 209.31000000000063, 0.2883870672503099, 1.9707548562964654, 1.168509967054224], "isController": false}, {"data": ["HTTP add random link - POST TICKET", 186, 0, 0.0, 77.91935483870968, 33, 935, 49.5, 116.7000000000001, 203.65, 855.8299999999996, 0.056764860720089724, 0.0337825191505108, 0.021501109642396637], "isController": false}, {"data": ["HTTP search POST - issuesGetter", 1009, 0, 0.0, 246.59960356788892, 161, 2303, 214.0, 276.0, 360.0, 1056.6, 0.2822323149567183, 225.95176714159223, 2.999732312858857], "isController": false}, {"data": ["031 /api/users/me/recent/issues", 978, 0, 0.0, 11.92535787321063, 2, 723, 5.0, 8.0, 11.0, 356.6200000000008, 0.2907455512660512, 0.19913244884974163, 0.18572642519574786], "isController": false}, {"data": ["036 /api/issues/TICKET/links", 972, 0, 0.0, 28.91460905349792, 6, 853, 21.0, 36.0, 47.0, 212.51999999999498, 0.29179436422601096, 8.235931754923206, 0.6722268718818606], "isController": false}, {"data": ["004 /hub/api/rest/settings/public", 1016, 0, 0.0, 9.808070866141733, 3, 637, 5.0, 9.0, 14.149999999999977, 51.980000000000246, 0.28874242726092286, 0.15283046442912127, 0.18529422704135354], "isController": false}, {"data": ["023 /api/issueLinkTypes", 985, 0, 0.0, 9.967512690355337, 3, 755, 5.0, 8.0, 13.0, 146.99999999999932, 0.28759417979453805, 0.4284005342937811, 0.1884918896981429], "isController": false}, {"data": ["019 /api/permissions/cache", 992, 0, 0.0, 10.803427419354833, 3, 613, 5.0, 9.0, 15.349999999999909, 236.5399999999986, 0.28820076437118053, 1.7167579747286859, 0.17284419581963628], "isController": false}, {"data": ["024 /api/issues/TICKET", 983, 0, 0.0, 32.98880976602234, 17, 860, 21.0, 33.0, 46.799999999999955, 555.959999999995, 0.2878205077528538, 3.1584028275839504, 1.7601093064623756], "isController": false}, {"data": ["002 /hub/api/rest/users/me", 1018, 0, 0.0, 10.305500982318263, 3, 595, 6.0, 9.0, 16.049999999999955, 92.61999999999989, 0.2887428849555313, 0.22709246542389042, 0.20616007984960408], "isController": false}, {"data": ["Transaction Change issue type", 192, 0, 0.0, 72.20833333333329, 18, 662, 45.0, 75.0, 328.09999999999997, 656.42, 0.059469181800076376, 0.30091572957535595, 0.07475238161296527], "isController": true}, {"data": ["009 /api/config", 100, 0, 0.0, 7.629999999999996, 2, 318, 4.0, 6.0, 7.0, 314.93999999999846, 0.2739620946045905, 0.2156381330579101, 0.16480532253557398], "isController": false}, {"data": ["012 /hub/api/rest/avatar/USER_ID", 1003, 0, 0.0, 9.502492522432712, 2, 696, 5.0, 7.0, 13.0, 82.28000000000065, 0.2881101839050678, 0.11901426542172236, 0.18263558682845266], "isController": false}, {"data": ["021 /api/users/me/recent/issues", 988, 0, 0.0, 20.47975708502025, 9, 870, 13.0, 20.0, 29.0, 142.73000000000195, 0.28802271531374213, 2.5595876827654265, 0.6750896791374478], "isController": false}, {"data": ["008 /api/inbox/folders", 1008, 0, 0.0, 14.78472222222224, 3, 775, 6.0, 9.0, 16.549999999999955, 447.52999999999736, 0.28887198070747844, 0.31728671466512487, 0.17239874614371667], "isController": false}, {"data": ["010 /youtrack/features/features-en_US.json", 1006, 0, 0.0, 128.2594433399601, 47, 209, 128.0, 150.0, 156.0, 170.0, 0.2886462462359066, 0.16377291900689622, 0.2100720297555258], "isController": false}, {"data": ["038 /api/issues/TICKET/activitiesPage", 972, 0, 0.0, 82.41049382716044, 6, 1162, 65.0, 98.0, 125.0, 827.1699999999987, 0.2919927302221488, 47.90310496915226, 1.540963024956066], "isController": false}, {"data": ["022 /api/users/me/recent/articles", 987, 0, 0.0, 9.100303951367787, 3, 554, 5.0, 8.0, 12.0, 126.36000000000013, 0.28773253642790114, 0.17121926152147252, 0.36251171418699235], "isController": false}, {"data": ["HTTP Change field - GET TICKET", 763, 0, 0.0, 12.119266055045854, 3, 877, 6.0, 10.0, 16.799999999999955, 198.20000000000027, 0.23143521072888745, 0.3515278904073897, 0.07436796935925205], "isController": false}, {"data": ["GET - Chunk", 2055, 0, 0.0, 20.061800486617994, 3, 1011, 15.0, 27.0, 36.19999999999982, 220.36000000000104, 0.579892870788581, 56.98791037120763, 0.26737125487617946], "isController": false}, {"data": ["011 /api/config", 100, 0, 0.0, 13.729999999999995, 4, 702, 6.0, 8.0, 9.0, 695.2899999999966, 0.2708126274511928, 0.6938224804608689, 0.26393652558231484], "isController": false}, {"data": ["015 /api/config", 100, 0, 0.0, 4.489999999999999, 2, 14, 4.0, 6.0, 7.0, 13.929999999999964, 0.28002497822805794, 0.1971660247094041, 0.15368558375407088], "isController": false}, {"data": ["020 /api/users/me/profiles/questionnaire", 989, 0, 0.0, 11.409504550050562, 3, 703, 5.0, 9.0, 17.0, 231.40000000000168, 0.2880531625557684, 0.20910545257841076, 0.1676926338231208], "isController": false}, {"data": ["HTTP search POST - count fields", 1006, 0, 0.0, 9.466202783300195, 2, 715, 5.0, 8.0, 12.649999999999977, 101.8999999999985, 0.28266676707050176, 0.18297809783880747, 0.11187594058350177], "isController": false}, {"data": ["025 /hub/api/rest/avatar/current_id", 1970, 0, 0.0, 8.673096446700491, 2, 801, 4.0, 7.0, 11.0, 179.8699999999999, 0.5774743383008829, 0.23854652841921237, 0.36885612281823893], "isController": false}, {"data": ["HTTP search POST - fields", 1011, 0, 0.0, 26.59742828882295, 13, 822, 17.0, 32.0, 42.0, 536.16, 0.2828318546440095, 2.074517986836569, 0.7905839123611509], "isController": false}, {"data": ["Transaction add comment random issue", 188, 0, 0.0, 88.39893617021278, 4, 940, 57.0, 142.79999999999995, 223.09999999999962, 859.0099999999986, 0.05703097934932506, 0.12020729320051182, 0.039695531072934734], "isController": true}, {"data": ["028 /api/tags", 979, 0, 0.0, 12.878447395301338, 4, 712, 7.0, 11.0, 18.0, 206.80000000000132, 0.29007149566077933, 0.5042232379230703, 0.3609241644703899], "isController": false}, {"data": ["Transaction ADD comment", 202, 0, 0.0, 73.06435643564353, 30, 1187, 53.0, 109.40000000000003, 132.85, 694.8999999999996, 0.061959902127893214, 0.0529781006828472, 0.03665928924630687], "isController": true}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["400/Bad Request", 3, 100.0, 0.005287834455529312], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 56734, 3, "400/Bad Request", 3, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["HTTP Create ticket", 29, 3, "400/Bad Request", 3, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
