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

    var data = {"OkPercent": 99.99595551061678, "KoPercent": 0.004044489383215369};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.9891544718573928, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.9994061757719715, 500, 1500, "037 /api/issues/TICKET"], "isController": false}, {"data": [0.9976498237367802, 500, 1500, "029 /api/savedQueries"], "isController": false}, {"data": [0.9967532467532467, 500, 1500, "HTTP Change field issue status - POST TICKET"], "isController": false}, {"data": [1.0, 500, 1500, "GET - Remote Module: static/current_name.js?remote_hash"], "isController": false}, {"data": [0.9988290398126464, 500, 1500, "027 /api/admin/projects/DEMO"], "isController": false}, {"data": [0.9914285714285714, 500, 1500, "HTTP Create comment to random issue"], "isController": false}, {"data": [0.48988095238095236, 500, 1500, "Transaction - Read ISSUE - /projects/DEMO/issues/TICKET/NEWSUMMARY"], "isController": true}, {"data": [0.9994033412887828, 500, 1500, "040 /api/issueListSubscription"], "isController": false}, {"data": [0.9047619047619048, 500, 1500, "Transaction - Create ISSUE"], "isController": true}, {"data": [1.0, 500, 1500, "001 /projects/DEMO/issues/TICKET/NEWSUMMARY"], "isController": false}, {"data": [0.9971131639722863, 500, 1500, "017 /api/admin/globalSettings"], "isController": false}, {"data": [1.0, 500, 1500, "HTTP Change field - GET issue types TICKET"], "isController": false}, {"data": [0.9976359338061466, 500, 1500, "033 /api/issues/TICKET"], "isController": false}, {"data": [0.9047619047619048, 500, 1500, "HTTP Create ticket"], "isController": false}, {"data": [0.9988452655889145, 500, 1500, "016 /api/users/me/profiles/grazie"], "isController": false}, {"data": [0.9434285714285714, 500, 1500, "Transaction - Search ISSUE"], "isController": true}, {"data": [0.9839743589743589, 500, 1500, "Transaction change priority"], "isController": true}, {"data": [0.9988649262202043, 500, 1500, "005 /hub/api/rest/users/me"], "isController": false}, {"data": [1.0, 500, 1500, "030 /api/users/me/profiles/appearance"], "isController": false}, {"data": [0.9968354430379747, 500, 1500, "Transaction Controller"], "isController": true}, {"data": [1.0, 500, 1500, "JSR223 gen random num of issue"], "isController": false}, {"data": [1.0, 500, 1500, "001 /projects/DEMO/issues/TICKET/NEWSUMMARY-9"], "isController": false}, {"data": [1.0, 500, 1500, "001 /projects/DEMO/issues/TICKET/NEWSUMMARY-8"], "isController": false}, {"data": [1.0, 500, 1500, "001 /projects/DEMO/issues/TICKET/NEWSUMMARY-7"], "isController": false}, {"data": [0.9976878612716763, 500, 1500, "018 /api/admin/widgets/general"], "isController": false}, {"data": [1.0, 500, 1500, "001 /projects/DEMO/issues/TICKET/NEWSUMMARY-6"], "isController": false}, {"data": [1.0, 500, 1500, "001 /projects/DEMO/issues/TICKET/NEWSUMMARY-5"], "isController": false}, {"data": [1.0, 500, 1500, "JSR223 Set search word"], "isController": false}, {"data": [1.0, 500, 1500, "001 /projects/DEMO/issues/TICKET/NEWSUMMARY-4"], "isController": false}, {"data": [0.993421052631579, 500, 1500, "HTTP Change field issue priority - POST TICKET"], "isController": false}, {"data": [1.0, 500, 1500, "001 /projects/DEMO/issues/TICKET/NEWSUMMARY-3"], "isController": false}, {"data": [0.9988479262672811, 500, 1500, "014 /api/admin/timeTrackingSettings/workTimeSettings"], "isController": false}, {"data": [1.0, 500, 1500, "001 /projects/DEMO/issues/TICKET/NEWSUMMARY-2"], "isController": false}, {"data": [1.0, 500, 1500, "001 /projects/DEMO/issues/TICKET/NEWSUMMARY-15"], "isController": false}, {"data": [0.9966101694915255, 500, 1500, "0012 dynamic vendor.js"], "isController": false}, {"data": [0.9988165680473373, 500, 1500, "034 /api/issues/TICKET/sprints"], "isController": false}, {"data": [1.0, 500, 1500, "001 /projects/DEMO/issues/TICKET/NEWSUMMARY-13"], "isController": false}, {"data": [1.0, 500, 1500, "001 /projects/DEMO/issues/TICKET/NEWSUMMARY-14"], "isController": false}, {"data": [1.0, 500, 1500, "001 /projects/DEMO/issues/TICKET/NEWSUMMARY-11"], "isController": false}, {"data": [1.0, 500, 1500, "001 /projects/DEMO/issues/TICKET/NEWSUMMARY-12"], "isController": false}, {"data": [1.0, 500, 1500, "001 /projects/DEMO/issues/TICKET/NEWSUMMARY-10"], "isController": false}, {"data": [0.9994075829383886, 500, 1500, "035 /api/issues/TICKET/watchers/issueWatchers"], "isController": false}, {"data": [0.9994314951677089, 500, 1500, "HTTP search - GET fields"], "isController": false}, {"data": [1.0, 500, 1500, "001 /projects/DEMO/issues/TICKET/NEWSUMMARY-1"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler -end"], "isController": false}, {"data": [1.0, 500, 1500, "001 /projects/DEMO/issues/TICKET/NEWSUMMARY-0"], "isController": false}, {"data": [1.0, 500, 1500, "HTTP Change field - GET status types TICKET"], "isController": false}, {"data": [0.9977246871444824, 500, 1500, "006 /api/permissions/cache"], "isController": false}, {"data": [1.0, 500, 1500, "007 /youtrack/features/features-en_US.json"], "isController": false}, {"data": [0.9983012457531144, 500, 1500, "003 /api/users/me"], "isController": false}, {"data": [0.9988636363636364, 500, 1500, "HTTP search POST - resent search"], "isController": false}, {"data": [0.9982142857142857, 500, 1500, "039 /api/issuesGetter"], "isController": false}, {"data": [0.9994103773584906, 500, 1500, "032 /api/issues/TICKET/sseSubscription"], "isController": false}, {"data": [0.9983202687569989, 500, 1500, "0011 dynamic fast-loader"], "isController": false}, {"data": [0.9967948717948718, 500, 1500, "HTTP Change field - GET priority types TICKET"], "isController": false}, {"data": [1.0, 500, 1500, "HTTP Change field issue type - POST TICKET"], "isController": false}, {"data": [0.9914285714285714, 500, 1500, "HTTP search - GET sorted Issues"], "isController": false}, {"data": [0.9988700564971752, 500, 1500, "0013 dynamic index.js"], "isController": false}, {"data": [1.0, 500, 1500, "013 /api/users/me"], "isController": false}, {"data": [0.9968152866242038, 500, 1500, "HTTP add random link - POST TICKET"], "isController": false}, {"data": [0.9845714285714285, 500, 1500, "HTTP search POST - issuesGetter"], "isController": false}, {"data": [1.0, 500, 1500, "031 /api/users/me/recent/issues"], "isController": false}, {"data": [0.9970308788598575, 500, 1500, "036 /api/issues/TICKET/links"], "isController": false}, {"data": [1.0, 500, 1500, "004 /hub/api/rest/settings/public"], "isController": false}, {"data": [1.0, 500, 1500, "023 /api/issueLinkTypes"], "isController": false}, {"data": [0.9994212962962963, 500, 1500, "019 /api/permissions/cache"], "isController": false}, {"data": [0.9970794392523364, 500, 1500, "024 /api/issues/TICKET"], "isController": false}, {"data": [0.9994343891402715, 500, 1500, "002 /hub/api/rest/users/me"], "isController": false}, {"data": [0.9970414201183432, 500, 1500, "Transaction Change issue type"], "isController": true}, {"data": [1.0, 500, 1500, "009 /api/config"], "isController": false}, {"data": [0.9982738780207134, 500, 1500, "012 /hub/api/rest/avatar/USER_ID"], "isController": false}, {"data": [0.9976744186046511, 500, 1500, "021 /api/users/me/recent/issues"], "isController": false}, {"data": [0.9982798165137615, 500, 1500, "008 /api/inbox/folders"], "isController": false}, {"data": [0.9994246260069045, 500, 1500, "010 /youtrack/features/features-en_US.json"], "isController": false}, {"data": [0.9970273483947681, 500, 1500, "038 /api/issues/TICKET/activitiesPage"], "isController": false}, {"data": [0.9988344988344988, 500, 1500, "022 /api/users/me/recent/articles"], "isController": false}, {"data": [0.9984615384615385, 500, 1500, "HTTP Change field - GET TICKET"], "isController": false}, {"data": [0.9991539763113367, 500, 1500, "GET - Chunk"], "isController": false}, {"data": [1.0, 500, 1500, "011 /api/config"], "isController": false}, {"data": [1.0, 500, 1500, "015 /api/config"], "isController": false}, {"data": [1.0, 500, 1500, "020 /api/users/me/profiles/questionnaire"], "isController": false}, {"data": [0.9977116704805492, 500, 1500, "HTTP search POST - count fields"], "isController": false}, {"data": [0.9988372093023256, 500, 1500, "025 /hub/api/rest/avatar/current_id"], "isController": false}, {"data": [0.9982896237172177, 500, 1500, "HTTP search POST - fields"], "isController": false}, {"data": [0.9968354430379747, 500, 1500, "Transaction add comment random issue"], "isController": true}, {"data": [0.9994138335287222, 500, 1500, "028 /api/tags"], "isController": false}, {"data": [0.9914772727272727, 500, 1500, "Transaction ADD comment"], "isController": true}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 49450, 2, 0.004044489383215369, 24.304044489383184, 0, 1499, 7.0, 56.0, 119.0, 236.9900000000016, 13.75758440744039, 607.3026231124705, 17.395172884079347], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["037 /api/issues/TICKET", 842, 0, 0.0, 18.225653206650815, 4, 716, 15.0, 22.0, 26.0, 54.70999999999981, 0.24943979731979601, 5.197189940888397, 0.5970619719956428], "isController": false}, {"data": ["029 /api/savedQueries", 851, 0, 0.0, 14.582843713278502, 5, 757, 9.0, 13.0, 18.399999999999977, 164.28000000000065, 0.24918859975332963, 1.4958444859079603, 0.28450926737819626], "isController": false}, {"data": ["HTTP Change field issue status - POST TICKET", 154, 0, 0.0, 36.01948051948052, 6, 648, 29.5, 48.5, 65.75, 503.349999999997, 0.04776279383810336, 0.07254798144818653, 0.023606685740510946], "isController": false}, {"data": ["GET - Remote Module: static/current_name.js?remote_hash", 200, 0, 0.0, 18.490000000000006, 12, 84, 16.0, 25.0, 31.94999999999999, 56.99000000000001, 0.5834373796660405, 63.58545561718923, 0.4352989824852099], "isController": false}, {"data": ["027 /api/admin/projects/DEMO", 854, 0, 0.0, 9.886416861826712, 4, 660, 7.0, 10.0, 15.0, 40.9500000000005, 0.24915734344589271, 0.3416069646661919, 0.3075860761671665], "isController": false}, {"data": ["HTTP Create comment to random issue", 175, 0, 0.0, 83.19428571428575, 31, 960, 57.0, 115.4, 144.2, 905.2800000000007, 0.05298234597956335, 0.04528571411271071, 0.03133290791032481], "isController": false}, {"data": ["Transaction - Read ISSUE - /projects/DEMO/issues/TICKET/NEWSUMMARY", 840, 0, 0.0, 806.1261904761899, 491, 2087, 709.0, 1215.6, 1376.5999999999995, 1661.8000000000006, 0.2478289154387088, 295.4263605258878, 13.174758707940999], "isController": true}, {"data": ["040 /api/issueListSubscription", 838, 0, 0.0, 8.256563245823404, 2, 645, 5.0, 9.0, 13.0, 58.49000000000012, 0.2483963172133609, 0.18079154873028871, 0.17272261676998235], "isController": false}, {"data": ["Transaction - Create ISSUE", 21, 2, 9.523809523809524, 183.1428571428571, 6, 388, 161.0, 387.4, 388.0, 388.0, 0.006078122983003831, 0.003896906694878805, 0.0075538428534587705], "isController": true}, {"data": ["001 /projects/DEMO/issues/TICKET/NEWSUMMARY", 893, 0, 0.0, 17.27323628219484, 2, 392, 5.0, 83.0, 96.29999999999995, 142.83999999999924, 0.25051470532541525, 50.96545377798548, 0.4756297960381085], "isController": false}, {"data": ["017 /api/admin/globalSettings", 866, 0, 0.0, 10.086605080831418, 2, 797, 5.0, 9.0, 13.0, 32.66000000000008, 0.24926860102171344, 0.21858760256784077, 0.175054478933637], "isController": false}, {"data": ["HTTP Change field - GET issue types TICKET", 169, 0, 0.0, 9.53254437869822, 5, 113, 7.0, 14.0, 19.5, 94.8000000000003, 0.052055499170654246, 0.1052465238900859, 0.022775484093040737], "isController": false}, {"data": ["033 /api/issues/TICKET", 846, 0, 0.0, 11.927895981087477, 4, 721, 7.0, 11.0, 15.0, 49.8299999999997, 0.24837659763989386, 0.1706023681137882, 0.8181541250736175], "isController": false}, {"data": ["HTTP Create ticket", 21, 2, 9.523809523809524, 183.1428571428571, 6, 388, 161.0, 387.4, 388.0, 388.0, 0.006085076321345347, 0.003901364734114039, 0.007562484406991927], "isController": false}, {"data": ["016 /api/users/me/profiles/grazie", 866, 0, 0.0, 10.060046189376452, 3, 718, 6.0, 10.0, 14.0, 31.0, 0.24982899983873622, 0.22795701722348818, 0.1776437942952442], "isController": false}, {"data": ["Transaction - Search ISSUE", 875, 0, 0.0, 366.7085714285715, 201, 1621, 301.0, 521.5999999999999, 803.1999999999996, 1278.2, 0.24610036394728108, 206.33585332049157, 4.061242141488021], "isController": true}, {"data": ["Transaction change priority", 156, 0, 0.0, 68.26282051282053, 13, 768, 44.0, 71.90000000000003, 304.50000000000006, 745.7700000000002, 0.04780788584947871, 0.215456312479697, 0.059354634721702944], "isController": true}, {"data": ["005 /hub/api/rest/users/me", 881, 0, 0.0, 9.833144154370038, 3, 733, 5.0, 9.0, 14.0, 89.05999999999915, 0.2506525929455947, 0.09815594704217138, 0.15742471175663086], "isController": false}, {"data": ["030 /api/users/me/profiles/appearance", 850, 0, 0.0, 7.884705882352938, 3, 396, 5.0, 9.0, 13.0, 43.49000000000001, 0.2494988741730213, 0.17648978208548183, 0.15572811623360022], "isController": false}, {"data": ["Transaction Controller", 158, 0, 0.0, 56.13291139240506, 13, 662, 43.0, 85.0, 170.09999999999997, 505.64999999999907, 0.048657889153017046, 0.20422226619653291, 0.060385982651460765], "isController": true}, {"data": ["JSR223 gen random num of issue", 904, 0, 0.0, 0.2643805309734515, 0, 21, 0.0, 1.0, 1.0, 1.0, 0.251524939504635, 0.0, 0.0], "isController": false}, {"data": ["001 /projects/DEMO/issues/TICKET/NEWSUMMARY-9", 100, 0, 0.0, 4.099999999999999, 2, 18, 3.0, 6.0, 9.0, 17.969999999999985, 0.29835427780363516, 0.7965826128077523, 0.20919762838184572], "isController": false}, {"data": ["001 /projects/DEMO/issues/TICKET/NEWSUMMARY-8", 100, 0, 0.0, 4.38, 2, 22, 4.0, 6.0, 12.799999999999955, 21.93999999999997, 0.29835160736928473, 0.3391418661893041, 0.20919575594838516], "isController": false}, {"data": ["001 /projects/DEMO/issues/TICKET/NEWSUMMARY-7", 100, 0, 0.0, 4.970000000000001, 3, 52, 4.0, 6.0, 10.949999999999989, 51.66999999999983, 0.29835427780363516, 0.36740697686560925, 0.20919762838184572], "isController": false}, {"data": ["018 /api/admin/widgets/general", 865, 0, 0.0, 12.475144508670505, 5, 741, 8.0, 12.0, 16.699999999999932, 69.34000000000003, 0.2498413579585448, 2.237922598353011, 0.19765916293541355], "isController": false}, {"data": ["001 /projects/DEMO/issues/TICKET/NEWSUMMARY-6", 100, 0, 0.0, 9.320000000000002, 2, 102, 7.5, 15.900000000000006, 19.0, 101.36999999999968, 0.29835427780363516, 0.5343571733319012, 0.20919762838184572], "isController": false}, {"data": ["001 /projects/DEMO/issues/TICKET/NEWSUMMARY-5", 100, 0, 0.0, 7.589999999999999, 2, 46, 6.0, 13.0, 14.949999999999989, 45.77999999999989, 0.29835249750875664, 0.35137999218316457, 0.20919638008914773], "isController": false}, {"data": ["JSR223 Set search word", 881, 0, 0.0, 0.16004540295119177, 0, 6, 0.0, 1.0, 1.0, 1.0, 0.24605206528730417, 0.0, 0.0], "isController": false}, {"data": ["001 /projects/DEMO/issues/TICKET/NEWSUMMARY-4", 100, 0, 0.0, 7.510000000000001, 2, 41, 7.0, 13.800000000000011, 18.0, 40.83999999999992, 0.2983480468645112, 0.1995785274435451, 0.20919325942257722], "isController": false}, {"data": ["HTTP Change field issue priority - POST TICKET", 152, 0, 0.0, 37.44736842105265, 6, 757, 30.0, 45.0, 54.099999999999966, 683.3299999999998, 0.047840504792863205, 0.07267547078833597, 0.0236712880095958], "isController": false}, {"data": ["001 /projects/DEMO/issues/TICKET/NEWSUMMARY-3", 100, 0, 0.0, 13.65, 8, 55, 13.0, 18.900000000000006, 21.899999999999977, 54.72999999999986, 0.2983462666439924, 42.878069050751684, 0.20977471873405712], "isController": false}, {"data": ["014 /api/admin/timeTrackingSettings/workTimeSettings", 868, 0, 0.0, 9.070276497695856, 3, 731, 5.0, 9.0, 14.0, 47.29999999999836, 0.24905499696715283, 0.1944156204611305, 0.15933790178051369], "isController": false}, {"data": ["001 /projects/DEMO/issues/TICKET/NEWSUMMARY-2", 100, 0, 0.0, 7.38, 2, 28, 6.0, 13.900000000000006, 15.0, 27.929999999999964, 0.29834982710627517, 0.3446756303385972, 0.2258018711009407], "isController": false}, {"data": ["001 /projects/DEMO/issues/TICKET/NEWSUMMARY-15", 100, 0, 0.0, 50.47, 34, 215, 44.5, 65.80000000000001, 86.79999999999995, 214.86999999999995, 0.29832846560720283, 135.8232751580395, 0.20917952959567543], "isController": false}, {"data": ["0012 dynamic vendor.js", 885, 0, 0.0, 91.14350282485883, 65, 951, 80.0, 106.39999999999998, 123.69999999999993, 325.8399999999999, 0.25046796472279, 86.19008698163391, 0.10007165842480839], "isController": false}, {"data": ["034 /api/issues/TICKET/sprints", 845, 0, 0.0, 12.373964497041422, 5, 754, 7.0, 11.0, 16.0, 151.89999999999873, 0.2488188466289463, 0.15626604577898703, 0.15795660374788908], "isController": false}, {"data": ["001 /projects/DEMO/issues/TICKET/NEWSUMMARY-13", 100, 0, 0.0, 17.14999999999999, 10, 107, 13.0, 18.0, 31.699999999999932, 106.83999999999992, 0.29834982710627517, 24.334530710639452, 0.21094265119623362], "isController": false}, {"data": ["001 /projects/DEMO/issues/TICKET/NEWSUMMARY-14", 100, 0, 0.0, 88.18, 64, 334, 78.0, 119.60000000000002, 151.39999999999986, 333.8099999999999, 0.29828308257668856, 321.84007932372515, 0.20943900036390536], "isController": false}, {"data": ["001 /projects/DEMO/issues/TICKET/NEWSUMMARY-11", 100, 0, 0.0, 5.139999999999999, 2, 83, 3.0, 6.0, 7.0, 82.90999999999995, 0.29835516795904177, 0.2103637024086213, 0.20919825253378127], "isController": false}, {"data": ["001 /projects/DEMO/issues/TICKET/NEWSUMMARY-12", 100, 0, 0.0, 4.520000000000001, 2, 74, 4.0, 6.0, 7.0, 73.35999999999967, 0.29835338765354014, 0.40207780757996614, 0.20919700423363458], "isController": false}, {"data": ["001 /projects/DEMO/issues/TICKET/NEWSUMMARY-10", 100, 0, 0.0, 4.83, 2, 96, 3.0, 6.900000000000006, 9.949999999999989, 95.16999999999958, 0.29835249750875664, 0.33448112025395765, 0.20919638008914773], "isController": false}, {"data": ["035 /api/issues/TICKET/watchers/issueWatchers", 844, 0, 0.0, 9.291469194312796, 3, 625, 6.0, 9.5, 14.0, 54.94999999999959, 0.24963228041158567, 0.3921101609470114, 0.14823505273112209], "isController": false}, {"data": ["HTTP search - GET fields", 1759, 0, 0.0, 7.6651506537805565, 2, 675, 5.0, 8.0, 12.0, 35.40000000000009, 0.49116475855161407, 0.35638224180063405, 0.16987872476497948], "isController": false}, {"data": ["001 /projects/DEMO/issues/TICKET/NEWSUMMARY-1", 100, 0, 0.0, 6.739999999999998, 2, 29, 5.5, 11.900000000000006, 15.0, 28.909999999999954, 0.2983444864447182, 1.7186856694701105, 0.2266718852089754], "isController": false}, {"data": ["Debug Sampler -end", 804, 0, 0.0, 114.07089552238816, 73, 352, 106.0, 154.0, 180.0, 261.95000000000005, 0.2420381053473864, 69.08968597672535, 0.0], "isController": false}, {"data": ["001 /projects/DEMO/issues/TICKET/NEWSUMMARY-0", 893, 0, 0.0, 5.996640537514002, 2, 219, 5.0, 8.0, 11.0, 34.059999999999945, 0.25051470532541525, 1.0783875205804985, 0.177126656468876], "isController": false}, {"data": ["HTTP Change field - GET status types TICKET", 158, 0, 0.0, 12.13924050632911, 4, 175, 7.0, 27.299999999999983, 42.0, 137.23999999999978, 0.04872496330979424, 0.05835660008153722, 0.021329518928106316], "isController": false}, {"data": ["006 /api/permissions/cache", 879, 0, 0.0, 9.874857792946544, 3, 697, 6.0, 9.0, 14.0, 36.200000000000045, 0.25043113186609367, 1.614390696284018, 0.1489700423183028], "isController": false}, {"data": ["007 /youtrack/features/features-en_US.json", 468, 0, 0.0, 46.53846153846155, 32, 185, 42.5, 56.0, 63.549999999999955, 133.55, 0.13352334732760723, 0.21562162759040285, 0.10327920805391147], "isController": false}, {"data": ["003 /api/users/me", 883, 0, 0.0, 10.782559456398628, 3, 802, 6.0, 10.0, 13.0, 59.07999999999879, 0.2503417036674351, 0.8471835335688945, 0.2256827446239615], "isController": false}, {"data": ["HTTP search POST - resent search", 880, 0, 0.0, 12.942045454545443, 5, 670, 7.0, 15.0, 20.949999999999932, 103.7199999999948, 0.24601518305067216, 0.14640240361027282, 0.08700433750277815], "isController": false}, {"data": ["039 /api/issuesGetter", 840, 0, 0.0, 16.34880952380951, 9, 777, 13.0, 18.0, 23.0, 45.59000000000003, 0.24877802602928947, 2.1312649442663183, 0.5845447757317924], "isController": false}, {"data": ["032 /api/issues/TICKET/sseSubscription", 848, 0, 0.0, 8.913915094339611, 2, 708, 5.0, 9.0, 13.0, 36.059999999999945, 0.24873826926269638, 0.17861535015411212, 0.15450439330668195], "isController": false}, {"data": ["0011 dynamic fast-loader", 893, 0, 0.0, 19.527435610302348, 11, 649, 14.0, 21.0, 28.299999999999955, 62.15999999998985, 0.25033548599424815, 6.409957463641784, 0.10123421938569409], "isController": false}, {"data": ["HTTP Change field - GET priority types TICKET", 156, 0, 0.0, 17.60256410256411, 4, 502, 7.0, 12.300000000000011, 32.30000000000001, 488.32000000000016, 0.04815235404820853, 0.07258542952980152, 0.02108172662149194], "isController": false}, {"data": ["HTTP Change field issue type - POST TICKET", 167, 0, 0.0, 34.26946107784433, 6, 315, 32.0, 49.0, 55.599999999999994, 226.5999999999991, 0.05188836358393859, 0.07881170277956953, 0.025861649776538258], "isController": false}, {"data": ["HTTP search - GET sorted Issues", 875, 0, 0.0, 66.28342857142849, 4, 1378, 29.0, 140.19999999999993, 209.39999999999986, 718.0400000000002, 0.24570279845659332, 6.84146307074654, 0.402522609571514], "isController": false}, {"data": ["0013 dynamic index.js", 885, 0, 0.0, 49.505084745762765, 35, 778, 43.0, 60.39999999999998, 75.0, 119.41999999999996, 0.2507842320476745, 32.25859128599179, 0.0999531130009663], "isController": false}, {"data": ["013 /api/users/me", 869, 0, 0.0, 12.783659378596093, 6, 482, 10.0, 16.0, 21.0, 55.09999999999968, 0.24867741674242885, 1.6992233945926827, 1.0076111270051942], "isController": false}, {"data": ["HTTP add random link - POST TICKET", 157, 0, 0.0, 77.21656050955414, 34, 1073, 54.0, 126.80000000000007, 181.0, 687.2999999999917, 0.049233880059369156, 0.0292886585327802, 0.018645531370762164], "isController": false}, {"data": ["HTTP search POST - issuesGetter", 875, 0, 0.0, 239.6605714285714, 158, 1499, 212.0, 276.4, 371.7999999999997, 962.5600000000004, 0.2455302274367542, 196.5594899309457, 2.6096141859017385], "isController": false}, {"data": ["031 /api/users/me/recent/issues", 850, 0, 0.0, 6.488235294117652, 2, 224, 5.0, 8.0, 13.0, 26.49000000000001, 0.24957388928608656, 0.17093718252733203, 0.15943080545568522], "isController": false}, {"data": ["036 /api/issues/TICKET/links", 842, 0, 0.0, 25.90736342042758, 6, 815, 19.0, 30.0, 46.0, 162.909999999996, 0.24948857804547922, 5.639916211320381, 0.5747637446687373], "isController": false}, {"data": ["004 /hub/api/rest/settings/public", 881, 0, 0.0, 7.566401816118045, 3, 488, 5.0, 9.0, 14.0, 44.7199999999998, 0.250720429930043, 0.13270554006062824, 0.16089513578887576], "isController": false}, {"data": ["023 /api/issueLinkTypes", 858, 0, 0.0, 8.268065268065259, 3, 476, 5.0, 9.0, 14.0, 39.0, 0.249423680133026, 0.37154275077908566, 0.16347307576026257], "isController": false}, {"data": ["019 /api/permissions/cache", 864, 0, 0.0, 8.023148148148149, 3, 741, 5.0, 8.0, 12.0, 40.45000000000016, 0.24980375659746468, 1.4881051606232372, 0.14981742677555102], "isController": false}, {"data": ["024 /api/issues/TICKET", 856, 0, 0.0, 28.505841121495322, 17, 761, 22.0, 33.0, 43.0, 106.88999999999885, 0.24956937620484282, 2.7364112016634268, 1.5261883254230144], "isController": false}, {"data": ["002 /hub/api/rest/users/me", 884, 0, 0.0, 9.045248868778287, 3, 635, 6.0, 10.0, 15.0, 48.349999999999795, 0.2505863550627231, 0.19708440100648406, 0.1789174882062836], "isController": false}, {"data": ["Transaction Change issue type", 169, 0, 0.0, 55.218934911242606, 15, 688, 46.0, 70.0, 85.0, 444.40000000000396, 0.05114611173034559, 0.2578579030502754, 0.06400150201981746], "isController": true}, {"data": ["009 /api/config", 100, 0, 0.0, 5.31, 3, 33, 4.0, 7.0, 13.949999999999989, 32.82999999999991, 0.2577684981118457, 0.20289200144350358, 0.1550638621454072], "isController": false}, {"data": ["012 /hub/api/rest/avatar/USER_ID", 869, 0, 0.0, 8.050632911392402, 2, 724, 5.0, 8.0, 13.0, 37.89999999999941, 0.2486776302309583, 0.10272523201923374, 0.15763962308169102], "isController": false}, {"data": ["021 /api/users/me/recent/issues", 860, 0, 0.0, 19.052325581395337, 9, 799, 13.0, 19.0, 27.0, 86.23999999999978, 0.24940288309732864, 2.219076765808663, 0.5845697263760369], "isController": false}, {"data": ["008 /api/inbox/folders", 872, 0, 0.0, 10.92087155963302, 3, 642, 7.0, 10.0, 15.0, 79.04999999999973, 0.24893915378958476, 0.27342525555516856, 0.14856927609807288], "isController": false}, {"data": ["010 /youtrack/features/features-en_US.json", 869, 0, 0.0, 128.43153049482146, 46, 1161, 124.0, 153.0, 159.0, 171.5999999999999, 0.24874753184626772, 0.1411350742213687, 0.18136489769076988], "isController": false}, {"data": ["038 /api/issues/TICKET/activitiesPage", 841, 0, 0.0, 59.70630202140307, 7, 878, 52.0, 75.0, 86.0, 313.0200000000069, 0.24898570152979657, 31.274184616698946, 1.3139970135778622], "isController": false}, {"data": ["022 /api/users/me/recent/articles", 858, 0, 0.0, 8.228438228438225, 3, 544, 5.0, 9.0, 13.0, 35.40999999999997, 0.24934141029012818, 0.1483765177895506, 0.31414409038335517], "isController": false}, {"data": ["HTTP Change field - GET TICKET", 650, 0, 0.0, 10.573846153846164, 3, 720, 6.0, 10.0, 17.0, 45.960000000000036, 0.19826049293658868, 0.30114178265540953, 0.06372394876186323], "isController": false}, {"data": ["GET - Chunk", 1773, 0, 0.0, 16.130287648054143, 3, 700, 15.0, 25.0, 31.0, 52.25999999999999, 0.4996267593667336, 49.10248364720983, 0.23035642622375446], "isController": false}, {"data": ["011 /api/config", 100, 0, 0.0, 8.270000000000003, 3, 42, 7.0, 13.0, 17.0, 41.8099999999999, 0.2545811884868203, 0.6522897111649125, 0.24811721299789716], "isController": false}, {"data": ["015 /api/config", 100, 0, 0.0, 6.470000000000001, 3, 24, 5.0, 12.0, 20.94999999999999, 23.989999999999995, 0.2511174727537542, 0.1768122049369695, 0.1378203317261815], "isController": false}, {"data": ["020 /api/users/me/profiles/questionnaire", 860, 0, 0.0, 7.479069767441858, 3, 389, 5.0, 9.0, 12.949999999999932, 38.77999999999997, 0.2491030119161033, 0.1808319165297807, 0.1450174183832809], "isController": false}, {"data": ["HTTP search POST - count fields", 874, 0, 0.0, 10.028604118993142, 3, 662, 5.0, 8.0, 12.0, 78.25, 0.245026920720895, 0.15860867322408048, 0.09694565287479097], "isController": false}, {"data": ["025 /hub/api/rest/avatar/current_id", 1720, 0, 0.0, 7.3912790697674415, 2, 622, 4.0, 8.0, 10.949999999999818, 33.0, 0.5008342384262158, 0.20688758091239187, 0.31990627738937244], "isController": false}, {"data": ["HTTP search POST - fields", 877, 0, 0.0, 23.11288483466363, 12, 828, 17.0, 29.0, 43.0, 77.22000000000003, 0.24508406634987384, 1.7972383054274244, 0.6850353021834839], "isController": false}, {"data": ["Transaction add comment random issue", 158, 0, 0.0, 84.1455696202532, 6, 1079, 61.0, 136.79999999999995, 186.04999999999998, 686.6499999999977, 0.049196508916088816, 0.10379790772774403, 0.03431641373018517], "isController": true}, {"data": ["028 /api/tags", 853, 0, 0.0, 11.95427901524033, 4, 595, 7.0, 11.0, 16.0, 156.900000000006, 0.24959678268869281, 0.43388740981377677, 0.31056693025145193], "isController": false}, {"data": ["Transaction ADD comment", 176, 0, 0.0, 82.72159090909095, 0, 960, 56.5, 115.30000000000001, 144.15, 904.5599999999993, 0.05217690341936593, 0.04434388285099344, 0.030681260635490967], "isController": true}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["400/Bad Request", 2, 100.0, 0.004044489383215369], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 49450, 2, "400/Bad Request", 2, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["HTTP Create ticket", 21, 2, "400/Bad Request", 2, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
