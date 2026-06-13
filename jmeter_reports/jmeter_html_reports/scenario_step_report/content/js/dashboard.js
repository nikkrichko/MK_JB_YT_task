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

    var data = {"OkPercent": 99.99841327769226, "KoPercent": 0.0015867223077289244};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.9232484675266067, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.859013531209079, 500, 1500, "037 /api/issues/TICKET"], "isController": false}, {"data": [0.9794104898136108, 500, 1500, "029 /api/savedQueries"], "isController": false}, {"data": [0.8897058823529411, 500, 1500, "HTTP Change field issue status - POST TICKET"], "isController": false}, {"data": [0.9975, 500, 1500, "GET - Remote Module: static/current_name.js?remote_hash"], "isController": false}, {"data": [0.9802944997834561, 500, 1500, "027 /api/admin/projects/DEMO"], "isController": false}, {"data": [0.7121896162528216, 500, 1500, "HTTP Create comment to random issue"], "isController": false}, {"data": [0.15430201931518875, 500, 1500, "Transaction - Read ISSUE - /projects/DEMO/issues/TICKET/NEWSUMMARY"], "isController": true}, {"data": [0.9815546772068511, 500, 1500, "040 /api/issueListSubscription"], "isController": false}, {"data": [0.47619047619047616, 500, 1500, "Transaction - Create ISSUE"], "isController": true}, {"data": [0.9796091758708582, 500, 1500, "001 /projects/DEMO/issues/TICKET/NEWSUMMARY"], "isController": false}, {"data": [0.9833836858006042, 500, 1500, "017 /api/admin/globalSettings"], "isController": false}, {"data": [0.9805194805194806, 500, 1500, "HTTP Change field - GET issue types TICKET"], "isController": false}, {"data": [0.9778645833333334, 500, 1500, "033 /api/issues/TICKET"], "isController": false}, {"data": [0.9810181190681622, 500, 1500, "016 /api/users/me/profiles/grazie"], "isController": false}, {"data": [0.47619047619047616, 500, 1500, "HTTP Create ticket"], "isController": false}, {"data": [0.4267335368512865, 500, 1500, "Transaction - Search ISSUE"], "isController": true}, {"data": [0.8229166666666666, 500, 1500, "Transaction change priority"], "isController": true}, {"data": [0.9880034275921166, 500, 1500, "005 /hub/api/rest/users/me"], "isController": false}, {"data": [0.9681266261925412, 500, 1500, "030 /api/users/me/profiles/appearance"], "isController": false}, {"data": [0.8182773109243697, 500, 1500, "Transaction Controller"], "isController": true}, {"data": [1.0, 500, 1500, "JSR223 gen random num of issue"], "isController": false}, {"data": [0.995, 500, 1500, "001 /projects/DEMO/issues/TICKET/NEWSUMMARY-9"], "isController": false}, {"data": [0.995, 500, 1500, "001 /projects/DEMO/issues/TICKET/NEWSUMMARY-8"], "isController": false}, {"data": [0.995, 500, 1500, "001 /projects/DEMO/issues/TICKET/NEWSUMMARY-7"], "isController": false}, {"data": [0.9740932642487047, 500, 1500, "018 /api/admin/widgets/general"], "isController": false}, {"data": [1.0, 500, 1500, "001 /projects/DEMO/issues/TICKET/NEWSUMMARY-6"], "isController": false}, {"data": [0.99, 500, 1500, "001 /projects/DEMO/issues/TICKET/NEWSUMMARY-5"], "isController": false}, {"data": [1.0, 500, 1500, "JSR223 Set search word"], "isController": false}, {"data": [0.995, 500, 1500, "001 /projects/DEMO/issues/TICKET/NEWSUMMARY-4"], "isController": false}, {"data": [0.888631090487239, 500, 1500, "HTTP Change field issue priority - POST TICKET"], "isController": false}, {"data": [0.995, 500, 1500, "001 /projects/DEMO/issues/TICKET/NEWSUMMARY-3"], "isController": false}, {"data": [0.9846982758620689, 500, 1500, "014 /api/admin/timeTrackingSettings/workTimeSettings"], "isController": false}, {"data": [0.995, 500, 1500, "001 /projects/DEMO/issues/TICKET/NEWSUMMARY-2"], "isController": false}, {"data": [0.99, 500, 1500, "001 /projects/DEMO/issues/TICKET/NEWSUMMARY-15"], "isController": false}, {"data": [0.9179136383069688, 500, 1500, "0012 dynamic vendor.js"], "isController": false}, {"data": [0.9830361026533275, 500, 1500, "034 /api/issues/TICKET/sprints"], "isController": false}, {"data": [1.0, 500, 1500, "001 /projects/DEMO/issues/TICKET/NEWSUMMARY-13"], "isController": false}, {"data": [0.915, 500, 1500, "001 /projects/DEMO/issues/TICKET/NEWSUMMARY-14"], "isController": false}, {"data": [1.0, 500, 1500, "001 /projects/DEMO/issues/TICKET/NEWSUMMARY-11"], "isController": false}, {"data": [1.0, 500, 1500, "001 /projects/DEMO/issues/TICKET/NEWSUMMARY-12"], "isController": false}, {"data": [1.0, 500, 1500, "001 /projects/DEMO/issues/TICKET/NEWSUMMARY-10"], "isController": false}, {"data": [0.9788946910356832, 500, 1500, "035 /api/issues/TICKET/watchers/issueWatchers"], "isController": false}, {"data": [0.9861291720849589, 500, 1500, "HTTP search - GET fields"], "isController": false}, {"data": [1.0, 500, 1500, "001 /projects/DEMO/issues/TICKET/NEWSUMMARY-1"], "isController": false}, {"data": [0.9847068819031436, 500, 1500, "001 /projects/DEMO/issues/TICKET/NEWSUMMARY-0"], "isController": false}, {"data": [0.9758403361344538, 500, 1500, "HTTP Change field - GET status types TICKET"], "isController": false}, {"data": [0.9845559845559846, 500, 1500, "006 /api/permissions/cache"], "isController": false}, {"data": [1.0, 500, 1500, "007 /youtrack/features/features-en_US.json"], "isController": false}, {"data": [0.9805222602739726, 500, 1500, "003 /api/users/me"], "isController": false}, {"data": [0.9382314694408322, 500, 1500, "HTTP search POST - resent search"], "isController": false}, {"data": [0.875438596491228, 500, 1500, "039 /api/issuesGetter"], "isController": false}, {"data": [0.9839409722222222, 500, 1500, "032 /api/issues/TICKET/sseSubscription"], "isController": false}, {"data": [0.9846678023850085, 500, 1500, "0011 dynamic fast-loader"], "isController": false}, {"data": [0.9756944444444444, 500, 1500, "HTTP Change field - GET priority types TICKET"], "isController": false}, {"data": [0.8733766233766234, 500, 1500, "HTTP Change field issue type - POST TICKET"], "isController": false}, {"data": [0.8137467476149176, 500, 1500, "HTTP search - GET sorted Issues"], "isController": false}, {"data": [0.9741342454040188, 500, 1500, "0013 dynamic index.js"], "isController": false}, {"data": [0.9801809564842741, 500, 1500, "013 /api/users/me"], "isController": false}, {"data": [0.7435064935064936, 500, 1500, "HTTP add random link - POST TICKET"], "isController": false}, {"data": [0.5080260303687636, 500, 1500, "HTTP search POST - issuesGetter"], "isController": false}, {"data": [0.9841579861111112, 500, 1500, "031 /api/users/me/recent/issues"], "isController": false}, {"data": [0.8620313862249346, 500, 1500, "036 /api/issues/TICKET/links"], "isController": false}, {"data": [0.985445205479452, 500, 1500, "004 /hub/api/rest/settings/public"], "isController": false}, {"data": [0.9798875432525952, 500, 1500, "023 /api/issueLinkTypes"], "isController": false}, {"data": [0.9842332613390928, 500, 1500, "019 /api/permissions/cache"], "isController": false}, {"data": [0.8462370242214533, 500, 1500, "024 /api/issues/TICKET"], "isController": false}, {"data": [0.9871630295250321, 500, 1500, "002 /hub/api/rest/users/me"], "isController": false}, {"data": [0.7911255411255411, 500, 1500, "Transaction Change issue type"], "isController": true}, {"data": [0.995, 500, 1500, "009 /api/config"], "isController": false}, {"data": [0.9877313818338356, 500, 1500, "012 /hub/api/rest/avatar/USER_ID"], "isController": false}, {"data": [0.8688984881209503, 500, 1500, "021 /api/users/me/recent/issues"], "isController": false}, {"data": [0.9832546157148991, 500, 1500, "008 /api/inbox/folders"], "isController": false}, {"data": [0.9995702621400946, 500, 1500, "010 /youtrack/features/features-en_US.json"], "isController": false}, {"data": [0.6413280908693753, 500, 1500, "038 /api/issues/TICKET/activitiesPage"], "isController": false}, {"data": [0.9824978392394123, 500, 1500, "022 /api/users/me/recent/articles"], "isController": false}, {"data": [0.9828150572831423, 500, 1500, "HTTP Change field - GET TICKET"], "isController": false}, {"data": [0.9866652442927245, 500, 1500, "GET - Chunk"], "isController": false}, {"data": [0.99, 500, 1500, "011 /api/config"], "isController": false}, {"data": [0.98, 500, 1500, "015 /api/config"], "isController": false}, {"data": [0.9816414686825053, 500, 1500, "020 /api/users/me/profiles/questionnaire"], "isController": false}, {"data": [0.9823298429319371, 500, 1500, "HTTP search POST - count fields"], "isController": false}, {"data": [0.985892741761792, 500, 1500, "025 /hub/api/rest/avatar/current_id"], "isController": false}, {"data": [0.959037711313394, 500, 1500, "HTTP search POST - fields"], "isController": false}, {"data": [0.724025974025974, 500, 1500, "Transaction add comment random issue"], "isController": true}, {"data": [0.9841854419410745, 500, 1500, "028 /api/tags"], "isController": false}, {"data": [0.7121896162528216, 500, 1500, "Transaction ADD comment"], "isController": true}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 126046, 2, 0.0015867223077289244, 206.0074575948491, 0, 27275, 78.0, 1064.0, 2486.800000000003, 11749.350000000104, 34.580198703221974, 1345.884579336657, 44.659406651367995], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["037 /api/issues/TICKET", 2291, 0, 0.0, 326.9127018769095, 4, 3448, 60.0, 987.2000000000016, 1375.8000000000002, 2343.039999999999, 0.6428367197537748, 26.00512684029899, 1.5387034800938075], "isController": false}, {"data": ["029 /api/savedQueries", 2307, 0, 0.0, 83.58127438231463, 5, 1322, 11.0, 210.0, 429.5999999999999, 894.2800000000007, 0.645474835294799, 3.8745834893160906, 0.7369458476480738], "isController": false}, {"data": ["HTTP Change field issue status - POST TICKET", 476, 0, 0.0, 281.1575630252101, 5, 3608, 56.0, 816.5000000000002, 1211.6, 2245.240000000009, 0.14272136053034776, 0.21678699567788148, 0.07064827982906419], "isController": false}, {"data": ["GET - Remote Module: static/current_name.js?remote_hash", 200, 0, 0.0, 46.704999999999984, 11, 524, 16.0, 103.9, 174.74999999999994, 481.93000000000006, 0.05970053020040871, 6.5063800790599196, 0.04453286424636737], "isController": false}, {"data": ["027 /api/admin/projects/DEMO", 2309, 0, 0.0, 74.50064963187522, 3, 1465, 6.0, 185.0, 406.0, 921.4000000000024, 0.6443469784759086, 0.8833889877048048, 0.7954358387973064], "isController": false}, {"data": ["HTTP Create comment to random issue", 443, 0, 0.0, 659.1196388261844, 31, 5164, 320.0, 1869.2000000000003, 2203.3999999999987, 3985.1200000000017, 0.1364569552233289, 0.11674218115892922, 0.08079721385623351], "isController": false}, {"data": ["Transaction - Read ISSUE - /projects/DEMO/issues/TICKET/NEWSUMMARY", 2278, 0, 0.0, 5989.4907813871805, 483, 37664, 2957.0, 16170.099999999999, 20288.24999999999, 26388.34000000002, 0.6372206215558477, 764.2442380381269, 33.00428202537134], "isController": true}, {"data": ["040 /api/issueListSubscription", 2277, 0, 0.0, 59.9635485287659, 2, 1283, 4.0, 104.0, 375.49999999999955, 861.8799999999992, 0.6389844496946373, 0.4650733225535693, 0.44432593884340726], "isController": false}, {"data": ["Transaction - Create ISSUE", 63, 2, 3.1746031746031744, 1328.9523809523816, 6, 4708, 1311.0, 2978.8, 4388.199999999998, 4708.0, 0.019271453410190747, 0.012171617206073628, 0.023673190544354322], "isController": true}, {"data": ["001 /projects/DEMO/issues/TICKET/NEWSUMMARY", 2354, 0, 0.0, 57.780373831775684, 2, 2483, 4.0, 87.5, 403.75, 768.0499999999984, 0.6486365543897181, 51.79287283720077, 0.7517730321947199], "isController": false}, {"data": ["017 /api/admin/globalSettings", 2317, 0, 0.0, 58.15968925334487, 2, 1438, 4.0, 107.40000000000055, 294.0999999999999, 838.5600000000013, 0.6451774586078424, 0.565754765997867, 0.45308349298017964], "isController": false}, {"data": ["HTTP Change field - GET issue types TICKET", 462, 0, 0.0, 76.19264069264064, 3, 1610, 10.0, 187.09999999999997, 425.7499999999995, 1099.4200000000003, 0.14106125081026252, 0.28519336755264535, 0.06170982466040725], "isController": false}, {"data": ["033 /api/issues/TICKET", 2304, 0, 0.0, 73.70095486111103, 4, 1123, 8.0, 157.0, 426.0, 898.6999999999989, 0.6443891853371254, 0.44260049885973324, 2.122615238668022], "isController": false}, {"data": ["016 /api/users/me/profiles/grazie", 2318, 0, 0.0, 64.35849870578082, 2, 1371, 5.0, 143.0999999999999, 366.0499999999997, 857.7699999999991, 0.6449008457994225, 0.588431756786552, 0.4585553788083022], "isController": false}, {"data": ["HTTP Create ticket", 63, 2, 3.1746031746031744, 1328.9523809523816, 6, 4708, 1311.0, 2978.8, 4388.199999999998, 4708.0, 0.019265925428024643, 0.01216812579930655, 0.023666399931713], "isController": false}, {"data": ["Transaction - Search ISSUE", 2293, 0, 0.0, 4502.290449193196, 200, 33281, 1356.0, 14126.8, 16528.999999999978, 21836.439999999995, 0.6312317966844502, 527.4309773567444, 10.419648577939096], "isController": true}, {"data": ["Transaction change priority", 432, 0, 0.0, 435.47685185185185, 12, 4052, 105.0, 1264.6999999999998, 1775.3999999999992, 3397.6000000000045, 0.12332395747721432, 0.5600726104591562, 0.1544342857801482], "isController": true}, {"data": ["005 /hub/api/rest/users/me", 2334, 0, 0.0, 40.71165381319614, 2, 1004, 5.0, 71.0, 134.25, 697.9000000000005, 0.6448857027126644, 0.25253824881618986, 0.40501896838457513], "isController": false}, {"data": ["030 /api/users/me/profiles/appearance", 2306, 0, 0.0, 98.55724197745018, 2, 4357, 5.0, 169.0, 548.7500000000014, 1620.5999999999967, 0.6451253728144839, 0.45633716999571133, 0.40264711747016857], "isController": false}, {"data": ["Transaction Controller", 476, 0, 0.0, 418.0357142857143, 12, 3696, 126.5, 1219.3, 1538.6999999999996, 2674.7100000000014, 0.14275787215192795, 0.6046608224038086, 0.17903691230093], "isController": true}, {"data": ["JSR223 gen random num of issue", 2373, 0, 0.0, 0.15634218289085564, 0, 24, 0.0, 1.0, 1.0, 1.0, 0.6514066045437601, 0.0, 0.0], "isController": false}, {"data": ["001 /projects/DEMO/issues/TICKET/NEWSUMMARY-9", 100, 0, 0.0, 20.39, 2, 748, 4.0, 26.300000000000097, 93.64999999999992, 742.4199999999971, 0.029860105406172083, 0.0797241486137446, 0.020932400453873602], "isController": false}, {"data": ["001 /projects/DEMO/issues/TICKET/NEWSUMMARY-8", 100, 0, 0.0, 23.589999999999996, 2, 813, 4.0, 11.800000000000011, 107.1499999999998, 808.7499999999978, 0.02986008757366484, 0.03394252142162682, 0.02093238795300739], "isController": false}, {"data": ["001 /projects/DEMO/issues/TICKET/NEWSUMMARY-7", 100, 0, 0.0, 18.040000000000003, 2, 828, 4.0, 12.900000000000006, 84.39999999999964, 821.9599999999969, 0.029860105406172083, 0.03677108683318652, 0.020932400453873602], "isController": false}, {"data": ["018 /api/admin/widgets/general", 2316, 0, 0.0, 91.76381692573405, 4, 2049, 9.0, 230.90000000000055, 491.2000000000007, 1038.83, 0.6451293016280323, 5.778655766222662, 0.5103802603386427], "isController": false}, {"data": ["001 /projects/DEMO/issues/TICKET/NEWSUMMARY-6", 100, 0, 0.0, 23.89, 3, 299, 8.0, 68.10000000000022, 161.59999999999923, 298.95, 0.0298600608249439, 0.053479835500924916, 0.020932369201736065], "isController": false}, {"data": ["001 /projects/DEMO/issues/TICKET/NEWSUMMARY-5", 100, 0, 0.0, 27.939999999999998, 2, 828, 7.0, 58.50000000000014, 88.94999999999999, 824.7999999999984, 0.029860158903821623, 0.03481566222815311, 0.02093243795656183], "isController": false}, {"data": ["JSR223 Set search word", 2308, 0, 0.0, 0.14124783362218382, 0, 10, 0.0, 1.0, 1.0, 1.0, 0.6361642273939814, 0.0, 0.0], "isController": false}, {"data": ["001 /projects/DEMO/issues/TICKET/NEWSUMMARY-4", 100, 0, 0.0, 20.64, 2, 505, 5.0, 84.40000000000003, 95.0, 500.94999999999794, 0.02986016782011518, 0.019974819293729393, 0.02093244420702293], "isController": false}, {"data": ["HTTP Change field issue priority - POST TICKET", 431, 0, 0.0, 294.4385150812065, 5, 3986, 54.0, 822.2, 1288.7999999999975, 2990.6000000000017, 0.12304972607874783, 0.18690067458586346, 0.06084568957666041], "isController": false}, {"data": ["001 /projects/DEMO/issues/TICKET/NEWSUMMARY-3", 100, 0, 0.0, 39.97, 8, 814, 14.0, 95.50000000000003, 187.74999999999994, 810.7099999999983, 0.0298600073276458, 4.291423974013881, 0.020990652026106008], "isController": false}, {"data": ["014 /api/admin/timeTrackingSettings/workTimeSettings", 2320, 0, 0.0, 55.234051724137885, 2, 1373, 4.0, 99.90000000000009, 267.9499999999998, 795.3699999999999, 0.6437254388917267, 0.5024934844476489, 0.4118295058491612], "isController": false}, {"data": ["001 /projects/DEMO/issues/TICKET/NEWSUMMARY-2", 100, 0, 0.0, 31.640000000000004, 1, 886, 8.0, 81.9, 97.79999999999995, 881.1599999999976, 0.029860194569027814, 0.034496689624179594, 0.02259460269518116], "isController": false}, {"data": ["001 /projects/DEMO/issues/TICKET/NEWSUMMARY-15", 100, 0, 0.0, 123.19999999999997, 34, 1309, 52.5, 312.30000000000007, 419.79999999999995, 1301.0999999999958, 0.02985832226087216, 13.594080366007047, 0.02093115044115671], "isController": false}, {"data": ["0012 dynamic vendor.js", 2339, 0, 0.0, 289.33518597691324, 64, 1852, 159.0, 671.0, 966.0, 1352.0, 0.6458883367036057, 222.260647115169, 0.25804996415029785], "isController": false}, {"data": ["034 /api/issues/TICKET/sprints", 2299, 0, 0.0, 70.09743366681168, 4, 1171, 8.0, 157.0, 353.0, 852.0, 0.64301792730625, 0.4007018726673469, 0.4082020040364129], "isController": false}, {"data": ["001 /projects/DEMO/issues/TICKET/NEWSUMMARY-13", 100, 0, 0.0, 36.269999999999996, 10, 309, 14.0, 106.50000000000003, 114.0, 308.10999999999956, 0.029859294048654526, 2.4354453259903357, 0.021106788480642666], "isController": false}, {"data": ["001 /projects/DEMO/issues/TICKET/NEWSUMMARY-14", 100, 0, 0.0, 268.0899999999999, 66, 2120, 89.5, 526.6000000000001, 1213.5999999999988, 2116.959999999998, 0.029855647942199463, 32.2138575223171, 0.02095843160817448], "isController": false}, {"data": ["001 /projects/DEMO/issues/TICKET/NEWSUMMARY-11", 100, 0, 0.0, 19.81, 2, 488, 3.0, 79.9, 102.89999999999998, 485.0699999999985, 0.029860114322433694, 0.021053713418747195, 0.020932406704312307], "isController": false}, {"data": ["001 /projects/DEMO/issues/TICKET/NEWSUMMARY-12", 100, 0, 0.0, 20.07, 2, 414, 4.0, 77.80000000000001, 96.79999999999995, 411.8799999999989, 0.029859454533456474, 0.04024028052360345, 0.020931944181930073], "isController": false}, {"data": ["001 /projects/DEMO/issues/TICKET/NEWSUMMARY-10", 100, 0, 0.0, 19.54, 2, 302, 3.0, 85.9, 102.94999999999999, 300.8299999999994, 0.02985937429083986, 0.033475157896371247, 0.020931887930602036], "isController": false}, {"data": ["035 /api/issues/TICKET/watchers/issueWatchers", 2298, 0, 0.0, 81.4216710182768, 3, 1879, 7.0, 214.19999999999982, 426.549999999997, 1004.0499999999988, 0.6431967944280909, 1.4850777202249286, 0.3819352701356563], "isController": false}, {"data": ["HTTP search - GET fields", 4614, 0, 0.0, 44.900520156046966, 2, 994, 4.0, 75.0, 179.25, 731.1000000000022, 1.2712719000968744, 0.922417013449197, 0.4396392657495545], "isController": false}, {"data": ["001 /projects/DEMO/issues/TICKET/NEWSUMMARY-1", 100, 0, 0.0, 20.14, 2, 406, 7.0, 58.50000000000014, 89.59999999999991, 403.8899999999989, 0.02986008757366484, 0.17201626620805552, 0.02268200245927681], "isController": false}, {"data": ["001 /projects/DEMO/issues/TICKET/NEWSUMMARY-0", 2354, 0, 0.0, 44.64613423959218, 2, 942, 4.0, 70.0, 256.5, 728.4499999999998, 0.6486365543897181, 2.79217766772449, 0.458638873544391], "isController": false}, {"data": ["HTTP Change field - GET status types TICKET", 476, 0, 0.0, 74.37184873949586, 3, 1630, 8.0, 161.4000000000001, 428.94999999999925, 975.7400000000007, 0.14273728123862373, 0.17095125120771934, 0.06247128058805961], "isController": false}, {"data": ["006 /api/permissions/cache", 2331, 0, 0.0, 58.55812955812952, 3, 1461, 5.0, 117.0, 292.0, 802.7199999999993, 0.6452947053444852, 4.159897320438651, 0.3838525718565137], "isController": false}, {"data": ["007 /youtrack/features/features-en_US.json", 332, 0, 0.0, 42.26204819277109, 33, 144, 38.0, 46.0, 53.0, 138.34000000000003, 0.09192161301388542, 0.1883624097153946, 0.07100098846882126], "isController": false}, {"data": ["003 /api/users/me", 2336, 0, 0.0, 66.29280821917814, 3, 1526, 6.0, 139.60000000000036, 373.75000000000045, 868.1500000000005, 0.6453134936267005, 2.183805722257321, 0.581739945153878], "isController": false}, {"data": ["HTTP search POST - resent search", 2307, 0, 0.0, 175.6618985695706, 5, 5210, 18.0, 519.8000000000011, 961.599999999999, 2266.440000000006, 0.6357632976356055, 0.37831765718882393, 0.2251650914278329], "isController": false}, {"data": ["039 /api/issuesGetter", 2280, 0, 0.0, 438.1280701754386, 9, 9533, 35.0, 1116.900000000001, 2781.4499999999944, 5861.260000000003, 0.6394563050812375, 5.478502563189081, 1.5025064916734656], "isController": false}, {"data": ["032 /api/issues/TICKET/sseSubscription", 2304, 0, 0.0, 55.782118055555465, 2, 1199, 5.0, 105.5, 282.0, 794.0, 0.6443174639396154, 0.46266676765587855, 0.40021404845230973], "isController": false}, {"data": ["0011 dynamic fast-loader", 2348, 0, 0.0, 61.48509369676324, 10, 938, 15.0, 102.0, 268.3999999999978, 728.5299999999993, 0.6475894393276543, 16.581831151534274, 0.26189164722703195], "isController": false}, {"data": ["HTTP Change field - GET priority types TICKET", 432, 0, 0.0, 84.61574074074073, 3, 1858, 6.0, 185.19999999999993, 475.74999999999983, 1111.2400000000011, 0.12333786523853602, 0.18589286496873442, 0.05396895923897682], "isController": false}, {"data": ["HTTP Change field issue type - POST TICKET", 462, 0, 0.0, 322.0584415584418, 5, 2563, 85.5, 922.8999999999999, 1324.6999999999998, 2240.69, 0.14114977182314484, 0.21438392602361844, 0.07036215638279573], "isController": false}, {"data": ["HTTP search - GET sorted Issues", 2306, 0, 0.0, 426.1352992194278, 3, 3765, 91.0, 1404.3000000000002, 1809.0, 2510.829999999995, 0.6357207228690467, 15.799442898801725, 1.0423953730606865], "isController": false}, {"data": ["0013 dynamic index.js", 2339, 0, 0.0, 142.23300555793057, 34, 1504, 60.0, 300.0, 509.0, 960.3999999999992, 0.645938993423242, 83.08768782785408, 0.2574394030898198], "isController": false}, {"data": ["013 /api/users/me", 2321, 0, 0.0, 76.7203791469194, 6, 1445, 12.0, 173.80000000000018, 382.8000000000002, 869.0200000000018, 0.6441567957015508, 4.401299939671011, 2.6100391522649566], "isController": false}, {"data": ["HTTP add random link - POST TICKET", 462, 0, 0.0, 614.1709956709964, 33, 5605, 216.5, 1685.1999999999998, 2203.949999999999, 3546.07, 0.13018250347153343, 0.07746041673476357, 0.04930907776051717], "isController": false}, {"data": ["HTTP search POST - issuesGetter", 2305, 0, 0.0, 3622.72711496746, 162, 27275, 823.0, 12150.000000000002, 14235.799999999996, 19255.840000000004, 0.6347353043631512, 508.1658802322636, 6.747196861829415], "isController": false}, {"data": ["031 /api/users/me/recent/issues", 2304, 0, 0.0, 56.23697916666672, 2, 1502, 4.0, 95.0, 243.5, 915.6999999999916, 0.6445974119861546, 0.44148454059075226, 0.41175836675690286], "isController": false}, {"data": ["036 /api/issues/TICKET/links", 2294, 0, 0.0, 324.2118570183087, 5, 3644, 73.0, 964.0, 1361.5, 2034.4000000000015, 0.6436024680218791, 25.058550756516965, 1.482713498600852], "isController": false}, {"data": ["004 /hub/api/rest/settings/public", 2336, 0, 0.0, 46.35958904109587, 2, 933, 5.0, 74.0, 183.30000000000018, 770.4500000000016, 0.6451224489908639, 0.34146129624321114, 0.41398708526165845], "isController": false}, {"data": ["023 /api/issueLinkTypes", 2312, 0, 0.0, 64.10380622837366, 3, 1265, 5.0, 109.70000000000027, 425.6999999999998, 870.8699999999999, 0.6447947742618676, 0.9604764570074996, 0.42258770024684594], "isController": false}, {"data": ["019 /api/permissions/cache", 2315, 0, 0.0, 55.639740820734325, 3, 1148, 5.0, 107.20000000000027, 270.1999999999989, 780.0, 0.6449324882442597, 3.8418843469069563, 0.3867791177441961], "isController": false}, {"data": ["024 /api/issues/TICKET", 2312, 0, 0.0, 518.392733564014, 15, 9046, 52.5, 1388.7000000000003, 2998.0999999999995, 6128.829999999999, 0.6445833669053836, 7.074273646183255, 3.9418096732914427], "isController": false}, {"data": ["002 /hub/api/rest/users/me", 2337, 0, 0.0, 45.58279845956351, 3, 1179, 6.0, 73.20000000000027, 138.19999999999982, 753.2399999999998, 0.6454668863334746, 0.5076565471250208, 0.460852343580615], "isController": false}, {"data": ["Transaction Change issue type", 462, 0, 0.0, 469.3030303030301, 13, 2628, 164.0, 1395.0, 1868.9999999999993, 2546.85, 0.14098781187831472, 0.7133207604896306, 0.1772524896212219], "isController": true}, {"data": ["009 /api/config", 100, 0, 0.0, 21.55, 2, 777, 3.0, 47.50000000000003, 70.79999999999995, 770.4399999999966, 0.0298391312754677, 0.023486659968776333, 0.017945440043636744], "isController": false}, {"data": ["012 /hub/api/rest/avatar/USER_ID", 2323, 0, 0.0, 42.974171330176446, 1, 955, 5.0, 71.59999999999991, 198.59999999999945, 723.8399999999979, 0.6448786695345214, 0.2663903097784205, 0.4087894309785499], "isController": false}, {"data": ["021 /api/users/me/recent/issues", 2315, 0, 0.0, 475.52354211663123, 9, 9768, 29.0, 1369.8000000000002, 3048.5999999999967, 6518.560000000009, 0.645230520100394, 5.740091077841558, 1.5123306161010797], "isController": false}, {"data": ["008 /api/inbox/folders", 2329, 0, 0.0, 65.04894804637188, 3, 1190, 6.0, 159.0, 366.5, 840.5999999999985, 0.6452138375512791, 0.708671559526725, 0.3850630953475899], "isController": false}, {"data": ["010 /youtrack/features/features-en_US.json", 2327, 0, 0.0, 137.1873657069187, 45, 10142, 139.0, 149.0, 154.0, 172.0, 0.6446063732096383, 0.36573857698710927, 0.4751674211486016], "isController": false}, {"data": ["038 /api/issues/TICKET/activitiesPage", 2289, 0, 0.0, 1444.2599388379208, 6, 15664, 275.0, 4620.0, 6124.5, 10536.499999999982, 0.641750630676297, 158.9749344371407, 3.3867767369286415], "isController": false}, {"data": ["022 /api/users/me/recent/articles", 2314, 0, 0.0, 57.571737251512566, 2, 1206, 5.0, 103.5, 325.5, 810.3999999999996, 0.6456222819483285, 0.3841801554362149, 0.8134041440984849], "isController": false}, {"data": ["HTTP Change field - GET TICKET", 1833, 0, 0.0, 59.930714675395485, 3, 1533, 6.0, 105.60000000000014, 286.5999999999999, 878.6600000000001, 0.5144376520088889, 0.7813716347379006, 0.16530730957878417], "isController": false}, {"data": ["GET - Chunk", 4687, 0, 0.0, 49.59995732878168, 3, 1059, 15.0, 77.0, 214.59999999999673, 709.1199999999999, 1.2928321326296266, 127.06393926745558, 0.5960632333208933], "isController": false}, {"data": ["011 /api/config", 100, 0, 0.0, 31.330000000000002, 4, 636, 6.0, 57.0, 115.29999999999961, 634.6999999999994, 0.029843833189685018, 0.07645383860335636, 0.029081416513667285], "isController": false}, {"data": ["015 /api/config", 100, 0, 0.0, 43.279999999999994, 2, 830, 3.0, 61.900000000000006, 431.24999999999574, 828.4199999999992, 0.029853098871075213, 0.021019613560591045, 0.01637955573215322], "isController": false}, {"data": ["020 /api/users/me/profiles/questionnaire", 2315, 0, 0.0, 62.23887688984881, 2, 1392, 5.0, 117.40000000000009, 329.7999999999993, 917.5600000000013, 0.6453781999886258, 0.4684886100679278, 0.37570188146214545], "isController": false}, {"data": ["HTTP search POST - count fields", 2292, 0, 0.0, 57.219458987783575, 2, 1297, 5.0, 100.0, 312.0, 779.4900000000011, 0.6316262888813932, 0.40890302374895554, 0.25020577759961615], "isController": false}, {"data": ["025 /hub/api/rest/avatar/current_id", 4643, 0, 0.0, 44.67154856773646, 1, 991, 3.0, 73.0, 185.0, 752.5600000000004, 1.2950188493159245, 0.5349540754498399, 0.8271615739102095], "isController": false}, {"data": ["HTTP search POST - fields", 2307, 0, 0.0, 162.08105765062848, 13, 1789, 43.0, 409.2000000000003, 720.1999999999998, 1201.6800000000003, 0.6355363146882718, 4.662642348719216, 1.7767394926969797], "isController": false}, {"data": ["Transaction add comment random issue", 462, 0, 0.0, 662.9588744588746, 38, 5685, 257.0, 1763.7999999999997, 2301.999999999999, 3677.61, 0.13017058263169418, 0.2751618926182855, 0.09112419546761247], "isController": true}, {"data": ["028 /api/tags", 2308, 0, 0.0, 69.14688041594454, 4, 1411, 8.0, 161.0999999999999, 334.09999999999945, 861.7299999999996, 0.6458538310773222, 1.1226679531274661, 0.8036029472257948], "isController": false}, {"data": ["Transaction ADD comment", 443, 0, 0.0, 659.1196388261844, 31, 5164, 320.0, 1869.2000000000003, 2203.3999999999987, 3985.1200000000017, 0.13641275111262613, 0.11670436348747974, 0.08077104026193097], "isController": true}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["400/Bad Request", 2, 100.0, 0.0015867223077289244], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 126046, 2, "400/Bad Request", 2, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["HTTP Create ticket", 63, 2, "400/Bad Request", 2, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
