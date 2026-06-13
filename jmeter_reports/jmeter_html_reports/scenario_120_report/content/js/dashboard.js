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

    var data = {"OkPercent": 100.0, "KoPercent": 0.0};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.9886716128213036, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.9988814317673378, 500, 1500, "037 /api/issues/TICKET"], "isController": false}, {"data": [0.9977802441731409, 500, 1500, "029 /api/savedQueries"], "isController": false}, {"data": [0.9970588235294118, 500, 1500, "HTTP Change field issue status - POST TICKET"], "isController": false}, {"data": [1.0, 500, 1500, "GET - Remote Module: static/current_name.js?remote_hash"], "isController": false}, {"data": [0.9983407079646017, 500, 1500, "027 /api/admin/projects/DEMO"], "isController": false}, {"data": [0.9917127071823204, 500, 1500, "HTTP Create comment to random issue"], "isController": false}, {"data": [0.4769144144144144, 500, 1500, "Transaction - Read ISSUE - /projects/DEMO/issues/TICKET/NEWSUMMARY"], "isController": true}, {"data": [0.9988726042841037, 500, 1500, "040 /api/issueListSubscription"], "isController": false}, {"data": [0.9615384615384616, 500, 1500, "Transaction - Create ISSUE"], "isController": true}, {"data": [0.9984177215189873, 500, 1500, "001 /projects/DEMO/issues/TICKET/NEWSUMMARY"], "isController": false}, {"data": [0.9983660130718954, 500, 1500, "017 /api/admin/globalSettings"], "isController": false}, {"data": [1.0, 500, 1500, "HTTP Change field - GET issue types TICKET"], "isController": false}, {"data": [0.9977753058954394, 500, 1500, "033 /api/issues/TICKET"], "isController": false}, {"data": [0.9615384615384616, 500, 1500, "HTTP Create ticket"], "isController": false}, {"data": [0.9956474428726877, 500, 1500, "016 /api/users/me/profiles/grazie"], "isController": false}, {"data": [0.9594594594594594, 500, 1500, "Transaction - Search ISSUE"], "isController": true}, {"data": [0.9883720930232558, 500, 1500, "Transaction change priority"], "isController": true}, {"data": [0.9989327641408752, 500, 1500, "005 /hub/api/rest/users/me"], "isController": false}, {"data": [0.9983351831298557, 500, 1500, "030 /api/users/me/profiles/appearance"], "isController": false}, {"data": [0.9912280701754386, 500, 1500, "Transaction Controller"], "isController": true}, {"data": [1.0, 500, 1500, "JSR223 gen random num of issue"], "isController": false}, {"data": [1.0, 500, 1500, "001 /projects/DEMO/issues/TICKET/NEWSUMMARY-9"], "isController": false}, {"data": [1.0, 500, 1500, "001 /projects/DEMO/issues/TICKET/NEWSUMMARY-8"], "isController": false}, {"data": [1.0, 500, 1500, "001 /projects/DEMO/issues/TICKET/NEWSUMMARY-7"], "isController": false}, {"data": [0.9983642311886587, 500, 1500, "018 /api/admin/widgets/general"], "isController": false}, {"data": [1.0, 500, 1500, "001 /projects/DEMO/issues/TICKET/NEWSUMMARY-6"], "isController": false}, {"data": [1.0, 500, 1500, "001 /projects/DEMO/issues/TICKET/NEWSUMMARY-5"], "isController": false}, {"data": [1.0, 500, 1500, "JSR223 Set search word"], "isController": false}, {"data": [1.0, 500, 1500, "001 /projects/DEMO/issues/TICKET/NEWSUMMARY-4"], "isController": false}, {"data": [1.0, 500, 1500, "HTTP Change field issue priority - POST TICKET"], "isController": false}, {"data": [1.0, 500, 1500, "001 /projects/DEMO/issues/TICKET/NEWSUMMARY-3"], "isController": false}, {"data": [0.9983748645720477, 500, 1500, "014 /api/admin/timeTrackingSettings/workTimeSettings"], "isController": false}, {"data": [1.0, 500, 1500, "001 /projects/DEMO/issues/TICKET/NEWSUMMARY-2"], "isController": false}, {"data": [1.0, 500, 1500, "001 /projects/DEMO/issues/TICKET/NEWSUMMARY-15"], "isController": false}, {"data": [0.9968152866242038, 500, 1500, "0012 dynamic vendor.js"], "isController": false}, {"data": [0.9960981047937569, 500, 1500, "034 /api/issues/TICKET/sprints"], "isController": false}, {"data": [1.0, 500, 1500, "001 /projects/DEMO/issues/TICKET/NEWSUMMARY-13"], "isController": false}, {"data": [1.0, 500, 1500, "001 /projects/DEMO/issues/TICKET/NEWSUMMARY-14"], "isController": false}, {"data": [1.0, 500, 1500, "001 /projects/DEMO/issues/TICKET/NEWSUMMARY-11"], "isController": false}, {"data": [1.0, 500, 1500, "001 /projects/DEMO/issues/TICKET/NEWSUMMARY-12"], "isController": false}, {"data": [1.0, 500, 1500, "001 /projects/DEMO/issues/TICKET/NEWSUMMARY-10"], "isController": false}, {"data": [0.9960981047937569, 500, 1500, "035 /api/issues/TICKET/watchers/issueWatchers"], "isController": false}, {"data": [0.999195710455764, 500, 1500, "HTTP search - GET fields"], "isController": false}, {"data": [1.0, 500, 1500, "001 /projects/DEMO/issues/TICKET/NEWSUMMARY-1"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler -end"], "isController": false}, {"data": [0.9984177215189873, 500, 1500, "001 /projects/DEMO/issues/TICKET/NEWSUMMARY-0"], "isController": false}, {"data": [1.0, 500, 1500, "HTTP Change field - GET status types TICKET"], "isController": false}, {"data": [0.9973290598290598, 500, 1500, "006 /api/permissions/cache"], "isController": false}, {"data": [1.0, 500, 1500, "007 /youtrack/features/features-en_US.json"], "isController": false}, {"data": [0.997867803837953, 500, 1500, "003 /api/users/me"], "isController": false}, {"data": [0.9983957219251337, 500, 1500, "HTTP search POST - resent search"], "isController": false}, {"data": [0.9988738738738738, 500, 1500, "039 /api/issuesGetter"], "isController": false}, {"data": [0.9977777777777778, 500, 1500, "032 /api/issues/TICKET/sseSubscription"], "isController": false}, {"data": [0.9978902953586498, 500, 1500, "0011 dynamic fast-loader"], "isController": false}, {"data": [0.9912790697674418, 500, 1500, "HTTP Change field - GET priority types TICKET"], "isController": false}, {"data": [1.0, 500, 1500, "HTTP Change field issue type - POST TICKET"], "isController": false}, {"data": [0.994073275862069, 500, 1500, "HTTP search - GET sorted Issues"], "isController": false}, {"data": [0.9952178533475027, 500, 1500, "0013 dynamic index.js"], "isController": false}, {"data": [0.9978401727861771, 500, 1500, "013 /api/users/me"], "isController": false}, {"data": [1.0, 500, 1500, "HTTP add random link - POST TICKET"], "isController": false}, {"data": [0.9875675675675676, 500, 1500, "HTTP search POST - issuesGetter"], "isController": false}, {"data": [0.9988901220865705, 500, 1500, "031 /api/users/me/recent/issues"], "isController": false}, {"data": [0.9972129319955407, 500, 1500, "036 /api/issues/TICKET/links"], "isController": false}, {"data": [0.9978655282817502, 500, 1500, "004 /hub/api/rest/settings/public"], "isController": false}, {"data": [0.9977997799779978, 500, 1500, "023 /api/issueLinkTypes"], "isController": false}, {"data": [0.9989059080962801, 500, 1500, "019 /api/permissions/cache"], "isController": false}, {"data": [0.9988998899889989, 500, 1500, "024 /api/issues/TICKET"], "isController": false}, {"data": [0.9994675186368477, 500, 1500, "002 /hub/api/rest/users/me"], "isController": false}, {"data": [1.0, 500, 1500, "Transaction Change issue type"], "isController": true}, {"data": [1.0, 500, 1500, "009 /api/config"], "isController": false}, {"data": [0.9983818770226537, 500, 1500, "012 /hub/api/rest/avatar/USER_ID"], "isController": false}, {"data": [0.9961622807017544, 500, 1500, "021 /api/users/me/recent/issues"], "isController": false}, {"data": [0.9978540772532188, 500, 1500, "008 /api/inbox/folders"], "isController": false}, {"data": [0.9957035445757251, 500, 1500, "010 /youtrack/features/features-en_US.json"], "isController": false}, {"data": [0.9943820224719101, 500, 1500, "038 /api/issues/TICKET/activitiesPage"], "isController": false}, {"data": [0.9978070175438597, 500, 1500, "022 /api/users/me/recent/articles"], "isController": false}, {"data": [0.997134670487106, 500, 1500, "HTTP Change field - GET TICKET"], "isController": false}, {"data": [0.9981432360742706, 500, 1500, "GET - Chunk"], "isController": false}, {"data": [1.0, 500, 1500, "011 /api/config"], "isController": false}, {"data": [1.0, 500, 1500, "015 /api/config"], "isController": false}, {"data": [0.9945175438596491, 500, 1500, "020 /api/users/me/profiles/questionnaire"], "isController": false}, {"data": [0.9994588744588745, 500, 1500, "HTTP search POST - count fields"], "isController": false}, {"data": [0.9991776315789473, 500, 1500, "025 /hub/api/rest/avatar/current_id"], "isController": false}, {"data": [0.9978494623655914, 500, 1500, "HTTP search POST - fields"], "isController": false}, {"data": [0.9945054945054945, 500, 1500, "Transaction add comment random issue"], "isController": true}, {"data": [0.9988901220865705, 500, 1500, "028 /api/tags"], "isController": false}, {"data": [0.9918032786885246, 500, 1500, "Transaction ADD comment"], "isController": true}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 52411, 0, 0.0, 24.66737898532744, 0, 8572, 7.0, 60.0, 115.0, 250.0, 14.561195723352006, 643.7208316281695, 18.388573759168644], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["037 /api/issues/TICKET", 894, 0, 0.0, 19.685682326621926, 4, 980, 16.0, 22.0, 28.0, 51.09999999999991, 0.26462935609816746, 6.263163594556154, 0.6334158203362036], "isController": false}, {"data": ["029 /api/savedQueries", 901, 0, 0.0, 12.640399556048834, 5, 732, 8.0, 11.0, 13.899999999999977, 38.86000000000013, 0.26503991189261444, 1.5908473294360799, 0.3026081841221384], "isController": false}, {"data": ["HTTP Change field issue status - POST TICKET", 170, 0, 0.0, 30.023529411764706, 6, 508, 26.5, 39.0, 54.14999999999992, 471.7899999999996, 0.05264660686425041, 0.07995945359635165, 0.02602057334554941], "isController": false}, {"data": ["GET - Remote Module: static/current_name.js?remote_hash", 200, 0, 0.0, 18.255000000000003, 11, 65, 16.0, 26.900000000000006, 31.94999999999999, 54.90000000000009, 0.6012740998175133, 65.52879790557441, 0.44865382244977103], "isController": false}, {"data": ["027 /api/admin/projects/DEMO", 904, 0, 0.0, 10.491150442477874, 4, 761, 6.0, 9.0, 12.0, 68.35000000000059, 0.2646934124134183, 0.3629678072676203, 0.32676638749417325], "isController": false}, {"data": ["HTTP Create comment to random issue", 181, 0, 0.0, 76.83425414364642, 26, 930, 53.0, 102.80000000000001, 132.70000000000002, 918.5200000000001, 0.0547216632483263, 0.04686050234940356, 0.032423376727965005], "isController": false}, {"data": ["Transaction - Read ISSUE - /projects/DEMO/issues/TICKET/NEWSUMMARY", 888, 0, 0.0, 857.1114864864882, 486, 9095, 706.0, 1309.9, 1474.0499999999995, 2129.8500000000004, 0.2637634469605273, 317.17168588877445, 13.998863390342724], "isController": true}, {"data": ["040 /api/issueListSubscription", 887, 0, 0.0, 7.6189402480270525, 2, 643, 4.0, 7.0, 9.0, 54.08000000000004, 0.26381316198663507, 0.19201483547516707, 0.18344391678300817], "isController": false}, {"data": ["Transaction - Create ISSUE", 26, 0, 0.0, 200.76923076923077, 92, 953, 139.5, 423.5000000000005, 947.75, 953.0, 0.0075203889313758725, 0.0047126716094905, 0.009554712890351572], "isController": true}, {"data": ["001 /projects/DEMO/issues/TICKET/NEWSUMMARY", 948, 0, 0.0, 18.89451476793251, 2, 706, 5.0, 88.0, 101.0, 173.05999999999995, 0.26607994355063475, 51.097551590003086, 0.4868330599558386], "isController": false}, {"data": ["017 /api/admin/globalSettings", 918, 0, 0.0, 9.29520697167756, 2, 680, 5.0, 7.0, 10.0, 59.95999999999913, 0.2639958036745455, 0.231519808456378, 0.18539513313095574], "isController": false}, {"data": ["HTTP Change field - GET issue types TICKET", 169, 0, 0.0, 8.029585798816575, 4, 52, 6.0, 10.0, 19.5, 45.7000000000001, 0.05183308152883668, 0.10479384168167986, 0.022675475587692066], "isController": false}, {"data": ["033 /api/issues/TICKET", 899, 0, 0.0, 12.433815350389311, 4, 858, 7.0, 9.0, 12.0, 172.0, 0.26485414903304666, 0.18192064637154234, 0.8724297556492153], "isController": false}, {"data": ["HTTP Create ticket", 26, 0, 0.0, 200.76923076923077, 92, 953, 139.5, 423.5000000000005, 947.75, 953.0, 0.00753971982401134, 0.004724785364475856, 0.009579272940467532], "isController": false}, {"data": ["016 /api/users/me/profiles/grazie", 919, 0, 0.0, 12.474428726877035, 3, 725, 6.0, 8.0, 11.0, 308.1999999999996, 0.2638145983343797, 0.2407149537987149, 0.1875856872650177], "isController": false}, {"data": ["Transaction - Search ISSUE", 925, 0, 0.0, 344.31351351351344, 211, 2038, 291.0, 447.79999999999995, 651.499999999999, 1218.22, 0.259457579387007, 217.85836986484364, 4.281517916247093], "isController": true}, {"data": ["Transaction change priority", 172, 0, 0.0, 64.296511627907, 11, 976, 42.0, 66.0, 107.1999999999997, 818.3200000000022, 0.05225950978756813, 0.2361389364832753, 0.06507574153813714], "isController": true}, {"data": ["005 /hub/api/rest/users/me", 937, 0, 0.0, 8.059765208110987, 2, 578, 5.0, 8.0, 10.0, 38.620000000000005, 0.2656019910228228, 0.10401015468764838, 0.16681397726934508], "isController": false}, {"data": ["030 /api/users/me/profiles/appearance", 901, 0, 0.0, 9.50832408435073, 3, 619, 5.0, 7.0, 9.899999999999977, 147.00000000000182, 0.26468735752123373, 0.18723518411781848, 0.16520927046171346], "isController": false}, {"data": ["Transaction Controller", 171, 0, 0.0, 57.14619883040937, 15, 687, 39.0, 69.0, 113.00000000000017, 571.8000000000002, 0.05161816923333736, 0.2181476677530128, 0.06451150968202907], "isController": true}, {"data": ["JSR223 gen random num of issue", 962, 0, 0.0, 0.29729729729729726, 0, 70, 0.0, 1.0, 1.0, 1.0, 0.26838447610624905, 0.0, 0.0], "isController": false}, {"data": ["001 /projects/DEMO/issues/TICKET/NEWSUMMARY-9", 100, 0, 0.0, 4.720000000000002, 2, 14, 4.0, 7.900000000000006, 10.949999999999989, 13.989999999999995, 0.3038479301878996, 0.8112502354821458, 0.21307336104426455], "isController": false}, {"data": ["001 /projects/DEMO/issues/TICKET/NEWSUMMARY-8", 100, 0, 0.0, 5.489999999999999, 2, 45, 4.0, 8.0, 12.949999999999989, 44.76999999999988, 0.30384608372782684, 0.3453875404874907, 0.21307206621413857], "isController": false}, {"data": ["001 /projects/DEMO/issues/TICKET/NEWSUMMARY-7", 100, 0, 0.0, 5.210000000000001, 2, 21, 4.0, 9.0, 12.949999999999989, 20.95999999999998, 0.3038479301878996, 0.3741721093427161, 0.21307336104426455], "isController": false}, {"data": ["018 /api/admin/widgets/general", 917, 0, 0.0, 12.355507088331514, 5, 828, 7.0, 11.0, 17.0, 81.37999999999943, 0.26448540715466196, 2.3690924997692604, 0.20924279109618674], "isController": false}, {"data": ["001 /projects/DEMO/issues/TICKET/NEWSUMMARY-6", 100, 0, 0.0, 8.280000000000006, 2, 56, 7.0, 14.900000000000006, 17.0, 55.72999999999986, 0.3038423908750053, 0.5441864695944919, 0.21306947660109748], "isController": false}, {"data": ["001 /projects/DEMO/issues/TICKET/NEWSUMMARY-5", 100, 0, 0.0, 8.999999999999998, 2, 40, 8.0, 15.0, 18.899999999999977, 39.93999999999997, 0.3038405444822557, 0.3578434537554691, 0.21306818181818182], "isController": false}, {"data": ["JSR223 Set search word", 936, 0, 0.0, 0.17628205128205127, 0, 19, 0.0, 1.0, 1.0, 1.0, 0.26063544369146663, 0.0, 0.0], "isController": false}, {"data": ["001 /projects/DEMO/issues/TICKET/NEWSUMMARY-4", 100, 0, 0.0, 7.67, 2, 42, 6.0, 16.900000000000006, 19.0, 41.81999999999991, 0.3038359285985568, 0.20324962020508924, 0.21306494492973793], "isController": false}, {"data": ["HTTP Change field issue priority - POST TICKET", 169, 0, 0.0, 30.62721893491123, 6, 319, 28.0, 42.0, 54.5, 186.00000000000216, 0.05251072741339614, 0.07976043776935052, 0.025976813134828285], "isController": false}, {"data": ["001 /projects/DEMO/issues/TICKET/NEWSUMMARY-3", 100, 0, 0.0, 14.029999999999998, 8, 47, 13.0, 19.0, 21.94999999999999, 46.86999999999993, 0.3038433140797953, 44.10970538212854, 0.21366356797126856], "isController": false}, {"data": ["014 /api/admin/timeTrackingSettings/workTimeSettings", 923, 0, 0.0, 9.300108342361856, 2, 660, 5.0, 8.0, 11.0, 112.39999999999941, 0.2648391711767754, 0.20673495579725198, 0.1694339442902339], "isController": false}, {"data": ["001 /projects/DEMO/issues/TICKET/NEWSUMMARY-2", 100, 0, 0.0, 8.380000000000006, 2, 21, 8.0, 15.0, 17.0, 20.989999999999995, 0.303847006955058, 0.35102637619905624, 0.2299860724128187], "isController": false}, {"data": ["001 /projects/DEMO/issues/TICKET/NEWSUMMARY-15", 100, 0, 0.0, 48.83999999999999, 36, 122, 45.0, 60.0, 71.0, 121.78999999999989, 0.3038146973397985, 138.31848272851423, 0.21305005650953368], "isController": false}, {"data": ["0012 dynamic vendor.js", 942, 0, 0.0, 84.70169851380047, 65, 951, 77.0, 96.0, 110.0, 192.66999999999803, 0.26575148850455543, 91.44939527518821, 0.10618069690647776], "isController": false}, {"data": ["034 /api/issues/TICKET/sprints", 897, 0, 0.0, 13.721293199554077, 4, 718, 7.0, 10.0, 12.099999999999909, 379.81999999999925, 0.2656599428342451, 0.1683743906776757, 0.16864365781681429], "isController": false}, {"data": ["001 /projects/DEMO/issues/TICKET/NEWSUMMARY-13", 100, 0, 0.0, 15.37, 11, 51, 14.0, 20.900000000000006, 24.94999999999999, 50.7999999999999, 0.3038414676758255, 24.782333788272627, 0.21484915030733562], "isController": false}, {"data": ["001 /projects/DEMO/issues/TICKET/NEWSUMMARY-14", 100, 0, 0.0, 84.22000000000001, 70, 177, 80.0, 98.9, 110.79999999999995, 176.69999999999985, 0.30378331743533976, 327.76427807698326, 0.21332471474746492], "isController": false}, {"data": ["001 /projects/DEMO/issues/TICKET/NEWSUMMARY-11", 100, 0, 0.0, 4.5299999999999985, 2, 16, 4.0, 8.900000000000006, 10.949999999999989, 15.969999999999985, 0.3038506999200873, 0.2142384817795928, 0.2130753033189612], "isController": false}, {"data": ["001 /projects/DEMO/issues/TICKET/NEWSUMMARY-12", 100, 0, 0.0, 4.890000000000003, 2, 21, 4.0, 10.0, 10.949999999999989, 20.91999999999996, 0.303851623175371, 0.40948753904493357, 0.21307595075172892], "isController": false}, {"data": ["001 /projects/DEMO/issues/TICKET/NEWSUMMARY-10", 100, 0, 0.0, 5.04, 2, 43, 4.0, 7.900000000000006, 13.949999999999989, 42.71999999999986, 0.30384608372782684, 0.34063994542924336, 0.21307206621413857], "isController": false}, {"data": ["035 /api/issues/TICKET/watchers/issueWatchers", 897, 0, 0.0, 12.793756967670022, 3, 779, 6.0, 9.0, 12.0, 398.079999999999, 0.26538964051390324, 0.4477401370358788, 0.15758694515591418], "isController": false}, {"data": ["HTTP search - GET fields", 1865, 0, 0.0, 6.87024128686327, 2, 732, 4.0, 7.0, 9.0, 25.019999999999754, 0.519108625080267, 0.3766579183932015, 0.1795208076794397], "isController": false}, {"data": ["001 /projects/DEMO/issues/TICKET/NEWSUMMARY-1", 100, 0, 0.0, 6.61, 2, 25, 5.0, 13.900000000000006, 17.899999999999977, 24.989999999999995, 0.303851623175371, 1.7504108643667124, 0.2308797567971608], "isController": false}, {"data": ["Debug Sampler -end", 864, 0, 0.0, 106.75578703703698, 72, 467, 94.0, 142.0, 189.25, 325.8000000000002, 0.26127765377505385, 74.58392522357913, 0.0], "isController": false}, {"data": ["001 /projects/DEMO/issues/TICKET/NEWSUMMARY-0", 948, 0, 0.0, 8.592827004219414, 2, 706, 5.0, 7.0, 9.0, 30.039999999999964, 0.26607994355063475, 1.145391007003123, 0.18814437727890596], "isController": false}, {"data": ["HTTP Change field - GET status types TICKET", 171, 0, 0.0, 12.13450292397661, 4, 398, 6.0, 22.200000000000045, 31.80000000000001, 195.68000000000032, 0.05302016502603879, 0.06349102992213167, 0.023186632841248323], "isController": false}, {"data": ["006 /api/permissions/cache", 936, 0, 0.0, 9.945512820512809, 3, 770, 5.0, 8.0, 10.0, 38.92999999999995, 0.26598306744972533, 1.7147791246485882, 0.15822049655287648], "isController": false}, {"data": ["007 /youtrack/features/features-en_US.json", 495, 0, 0.0, 44.36969696969698, 32, 151, 41.0, 53.0, 59.0, 130.12000000000006, 0.14079683613865104, 0.2192531286941392, 0.10893894090984337], "isController": false}, {"data": ["003 /api/users/me", 938, 0, 0.0, 10.650319829424307, 3, 621, 6.0, 9.0, 12.0, 59.270000000000095, 0.2648007529600941, 0.8961142518560048, 0.23871634376783804], "isController": false}, {"data": ["HTTP search POST - resent search", 935, 0, 0.0, 11.350802139037434, 4, 636, 6.0, 10.0, 15.0, 62.559999999999945, 0.26053937502316293, 0.15503703769238464, 0.09210310727339553], "isController": false}, {"data": ["039 /api/issuesGetter", 888, 0, 0.0, 17.938063063063087, 10, 785, 13.0, 17.0, 26.549999999999955, 145.5400000000002, 0.26329069486802553, 2.255899801879682, 0.6186418669860154], "isController": false}, {"data": ["032 /api/issues/TICKET/sseSubscription", 900, 0, 0.0, 8.96222222222223, 3, 657, 5.0, 8.0, 10.0, 35.97000000000003, 0.2644628099173554, 0.18990645087235997, 0.1642722681359045], "isController": false}, {"data": ["0011 dynamic fast-loader", 948, 0, 0.0, 18.23206751054853, 10, 789, 14.0, 19.0, 22.549999999999955, 56.07999999999993, 0.26640954960205776, 6.821541397037064, 0.10774696945086192], "isController": false}, {"data": ["HTTP Change field - GET priority types TICKET", 172, 0, 0.0, 22.331395348837216, 4, 943, 6.0, 13.700000000000017, 31.349999999999994, 759.0400000000026, 0.0527636818988054, 0.0795259840810131, 0.023094296407038674], "isController": false}, {"data": ["HTTP Change field issue type - POST TICKET", 169, 0, 0.0, 28.89940828402368, 6, 115, 28.0, 39.0, 48.0, 84.2000000000005, 0.052044646299656445, 0.0790467763191932, 0.025909245377265175], "isController": false}, {"data": ["HTTP search - GET sorted Issues", 928, 0, 0.0, 59.529094827586185, 4, 1059, 29.0, 128.0, 185.0, 599.7100000000037, 0.2590554970571519, 7.524234951000685, 0.4243711963436885], "isController": false}, {"data": ["0013 dynamic index.js", 941, 0, 0.0, 51.307120085016, 34, 758, 41.0, 55.80000000000007, 69.0, 509.14000000000135, 0.2655197118052998, 34.154028710518055, 0.10582965889393688], "isController": false}, {"data": ["013 /api/users/me", 926, 0, 0.0, 14.84125269978403, 6, 845, 10.0, 13.0, 17.0, 163.0400000000027, 0.26534274201636415, 1.8131489130833456, 1.0751341900713673], "isController": false}, {"data": ["HTTP add random link - POST TICKET", 181, 0, 0.0, 62.31491712707183, 33, 239, 48.0, 115.60000000000002, 166.20000000000005, 222.60000000000014, 0.056386995476579146, 0.03356952608054306, 0.021382726050324614], "isController": false}, {"data": ["HTTP search POST - issuesGetter", 925, 0, 0.0, 229.1881081081082, 164, 1911, 206.0, 247.39999999999998, 285.69999999999993, 1067.0800000000004, 0.2588864524019765, 207.25181732167272, 2.751544266434742], "isController": false}, {"data": ["031 /api/users/me/recent/issues", 901, 0, 0.0, 9.405105438401769, 2, 708, 5.0, 7.0, 11.0, 185.1400000000017, 0.26474654411732296, 0.1813305960947681, 0.169124336021691], "isController": false}, {"data": ["036 /api/issues/TICKET/links", 897, 0, 0.0, 24.876254180602018, 6, 857, 19.0, 28.0, 38.09999999999991, 116.77999999999929, 0.26505071421859683, 6.74455016478132, 0.6106120603098227], "isController": false}, {"data": ["004 /hub/api/rest/settings/public", 937, 0, 0.0, 10.02881536819637, 2, 669, 5.0, 8.0, 10.0, 119.72000000000025, 0.26532041333352585, 0.14043326565114359, 0.17026455712161612], "isController": false}, {"data": ["023 /api/issueLinkTypes", 909, 0, 0.0, 9.066006600660062, 3, 666, 5.0, 8.0, 11.0, 36.499999999999886, 0.2642013301330773, 0.3935521687179812, 0.1731550521746763], "isController": false}, {"data": ["019 /api/permissions/cache", 914, 0, 0.0, 9.305251641137856, 3, 596, 5.0, 8.0, 10.0, 88.95000000000016, 0.2636845501913732, 1.570902195318128, 0.15813759209125217], "isController": false}, {"data": ["024 /api/issues/TICKET", 909, 0, 0.0, 27.100110011001117, 16, 899, 21.0, 30.0, 43.5, 150.0999999999998, 0.2639649510300005, 2.894925149946757, 1.614216900620971], "isController": false}, {"data": ["002 /hub/api/rest/users/me", 939, 0, 0.0, 8.79126730564431, 3, 509, 5.0, 8.0, 10.0, 36.00000000000023, 0.26498917325917776, 0.2084236127612182, 0.18920317804986592], "isController": false}, {"data": ["Transaction Change issue type", 169, 0, 0.0, 45.76331360946747, 18, 402, 42.0, 60.0, 74.5, 208.80000000000314, 0.05163535903837241, 0.26124437520222576, 0.06488285294753877], "isController": true}, {"data": ["009 /api/config", 100, 0, 0.0, 5.41, 2, 19, 5.0, 7.900000000000006, 10.949999999999989, 18.97999999999999, 0.26987202668494603, 0.21241880225397117, 0.1623659748047476], "isController": false}, {"data": ["012 /hub/api/rest/avatar/USER_ID", 927, 0, 0.0, 9.428263214670986, 2, 617, 4.0, 7.0, 10.0, 248.44000000000005, 0.2654429374997852, 0.1096507446898527, 0.1682681070668527], "isController": false}, {"data": ["021 /api/users/me/recent/issues", 912, 0, 0.0, 20.253289473684212, 10, 761, 13.0, 19.0, 32.0, 226.73000000000036, 0.26425238884739016, 2.3553512222469797, 0.6193720959763517], "isController": false}, {"data": ["008 /api/inbox/folders", 932, 0, 0.0, 11.864806866952794, 3, 762, 6.0, 8.0, 11.349999999999909, 257.6999999999914, 0.26552751942026115, 0.29165019361500333, 0.15847160280046063], "isController": false}, {"data": ["010 /youtrack/features/features-en_US.json", 931, 0, 0.0, 148.26745435016113, 48, 8572, 124.0, 149.80000000000007, 156.0, 180.39999999999975, 0.26632011678037, 0.15110545688417476, 0.19396389236648165], "isController": false}, {"data": ["038 /api/issues/TICKET/activitiesPage", 890, 0, 0.0, 67.89213483146057, 6, 959, 56.0, 80.0, 95.0, 565.0700000000039, 0.2636731566802187, 37.708742483463396, 1.3915037222724715], "isController": false}, {"data": ["022 /api/users/me/recent/articles", 912, 0, 0.0, 9.03618421052632, 3, 756, 5.0, 7.0, 10.0, 31.610000000000014, 0.2642482542809956, 0.15724345491191724, 0.332921426346594], "isController": false}, {"data": ["HTTP Change field - GET TICKET", 698, 0, 0.0, 12.180515759312327, 3, 690, 6.0, 8.0, 14.0, 306.6399999999994, 0.21099457036608465, 0.32048354578642635, 0.06780855008642314], "isController": false}, {"data": ["GET - Chunk", 1885, 0, 0.0, 17.870026525198924, 3, 845, 14.0, 23.0, 29.0, 189.43999999999414, 0.5309688646618108, 52.18154696713613, 0.24481525672485446], "isController": false}, {"data": ["011 /api/config", 100, 0, 0.0, 7.010000000000001, 3, 25, 6.0, 9.0, 11.949999999999989, 24.93999999999997, 0.2700702722848485, 0.691865179569724, 0.2632341185176383], "isController": false}, {"data": ["015 /api/config", 100, 0, 0.0, 4.750000000000001, 2, 12, 4.0, 7.0, 9.899999999999977, 11.989999999999995, 0.25529220746065945, 0.17975164216712447, 0.1401314882514526], "isController": false}, {"data": ["020 /api/users/me/profiles/questionnaire", 912, 0, 0.0, 14.947368421052621, 3, 741, 5.0, 7.0, 9.0, 559.4200000000003, 0.26477837875501903, 0.19220764371557808, 0.15413991120343515], "isController": false}, {"data": ["HTTP search POST - count fields", 924, 0, 0.0, 7.363636363636359, 2, 807, 5.0, 7.0, 9.0, 31.5, 0.25865572922440233, 0.16742902223655468, 0.1023091094824758], "isController": false}, {"data": ["025 /hub/api/rest/avatar/current_id", 1824, 0, 0.0, 6.658991228070173, 2, 693, 4.0, 6.0, 7.0, 29.5, 0.5299244625217896, 0.2189043434049971, 0.3384807615485183], "isController": false}, {"data": ["HTTP search POST - fields", 930, 0, 0.0, 22.783870967741905, 12, 823, 17.0, 27.899999999999977, 38.0, 58.75999999999976, 0.25956315799609425, 1.9031709756476727, 0.7254797352518586], "isController": false}, {"data": ["Transaction add comment random issue", 182, 0, 0.0, 74.89010989010991, 6, 662, 55.0, 124.50000000000009, 177.54999999999998, 553.2699999999984, 0.056715593734360366, 0.11974035905021947, 0.039633173881752345], "isController": true}, {"data": ["028 /api/tags", 901, 0, 0.0, 11.836847946725866, 4, 691, 7.0, 10.0, 15.899999999999977, 200.16000000000076, 0.2651251546686009, 0.4608882350160885, 0.32989119450137494], "isController": false}, {"data": ["Transaction ADD comment", 183, 0, 0.0, 75.9945355191257, 0, 930, 53.0, 102.6, 132.39999999999995, 918.24, 0.055506132517706606, 0.0470127985236582, 0.03252875238517131], "isController": true}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": []}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 52411, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
