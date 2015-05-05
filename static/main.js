function createIOTypeForm(select_id, container_id) {
    select_id = select_id + " option:selected";
    var selected_option = $(select_id).text();
    var new_form = "";
    var reg_exp = /\d/;
    var number = select_id.match(reg_exp);
    var format_select;
    var io_number = "_" + select_id.charAt(1) + number;
    console.log("New form for " + io_number);

    if (select_id.charAt(1) == "i") {
        format_select = '<label for="format' + io_number + '">Input format: </label>' +
            '<select id="format' + io_number + '">' +
            '<option value="rtcm2">rtcm2</option>' +
            '<option value="rtcm3">rtcm3</option>' +
            '<option value="oem4">oem4</option>' +
            '<option value="oem3">oem3</option>' +
            '<option value="ubx" selected>ubx</option>' +
            '<option value="ss2">ss2</option>' +
            '<option value="hemis">hemis</option>' +
            '<option value="skytraq">skytraq</option>' +
            '<option value="sp3">sp3</option>' +
            '</select>';
    } else {
        format_select = '<label for="format' + io_number + '">Output format: </label>' +
            '<select id="format' + io_number + '">' +
            '<option value="llh">llh</option>' +
            '<option value="xyz">xyz</option>' +
            '<option value="enu">enu</option>' +
            '<option value="nmea">nmea</option>' +
            '</select>';
    }

    switch (selected_option) {
        case "Off":
            break;
        case "Serial":
            new_form = '<label for="serial_port_value' + io_number + '">Serial Device: </label>' +
                '<input type="text" id="serial_port_value' + io_number + '" value="/dev/MFD1" data-clear-btn="true"/>' +
                '<label for="serial_port_baudrate' + io_number + '">Baudrate: </label>' +
                '<select id="serial_port_baudrate' + io_number + '"><option>9600</option><option>115200</option></select>';
            break;
        case "File":
            new_form = '<label for="file_path' + io_number + '">Absolute Path to the file</label>' +
                '<input type="text" id="file_path' + io_number + '" value="/home/root/" data-clear-btn="true"/>';
            break;
        case "TCP client":
            new_form = '<label for="tcp_client_address' + io_number + '">TCP address</label>' +
                '<input type="text" id="tcp_client_address' + io_number + '" value="192.168.1." data-clear-btn="true"/>';
            break;
        case "TCP server":
            new_form = '<label for="tcp_server_address' + io_number + '">TCP address</label>' +
                '<input type="text" id="tcp_server_address' + io_number + '" value="localhost" data-clear-btn="true"/>' +
                '<label for="tcp_server_port' + io_number + '">TCP port</label>' +
                '<input type="text" id="tcp_server_port' + io_number + '" data-clear-btn="true" data-clear-btn="true"/>';
            break;
        case "NTRIP client":
            new_form = '<label for="ntrip_client_address' + io_number + '">NTRIP address: </label>' +
                '<input type="text" id="ntrip_client_address' + io_number + '" data-clear-btn="true"/>' +
                '<label for="ntrip_client_port' + io_number + '">Port: </label>' +
                '<input type="text" id="ntrip_client_port' + io_number + '" data-clear-btn="true"/>' +
                '<label for="ntrip_mount_point' + io_number + '">Mount point</label>' +
                '<input type="text" id="ntrip_mount_point' + io_number + '" data-clear-btn="true"/>' +
                '<label for="ntrip_client_username' + io_number + '">Username: </label>' +
                '<input type="text" id="ntrip_client_username' + io_number + '" data-clear-btn="true"/>' +
                '<label for="ntrip_client_password' + io_number + '">Password: </label>' +
                '<input type="text" id="ntrip_client_password' + io_number + '" data-clear-btn="true"/>';
            break;
        case "NTRIP server":
            new_form = '';
        case "ftp":
            new_form = '<label for="ftp_path' + io_number + '">FTP path: </label>' +
                '<input type="text" id="ftp_path' + io_number + '" data-clear-btn="true"/>';
            break;
        case "http":
            new_form = '<label for="http_path' + io_number + '">HTTP path: </label>' +
                '<input type="text" id="http_path' + io_number + '" data-clear-btn="true"/>';
            break;
    }

    if (select_id != "Off") {
        new_form += format_select;
    }

    console.log("New form = " + new_form);

    //update form vars
    $(container_id).html(new_form).trigger("create");
}

var isActive = true;

function onFocus() {
    isActive = true;
}

function onBlur() {
    isActive = false;
}

// main

$(document).ready(function () {

    window.onfocus = onFocus;
    window.onblur = onBlur;

    // Initial formatting for the info blocks
    var grid_style = {
        backgroundColor: "Gainsboro",
        border: "1px solid black",
        textAlign: "left"
    };

    $("#status_block").css(grid_style);
    $("#mode_block").css(grid_style);
    $("#lat_block").css(grid_style);
    $("#lon_block").css(grid_style);
    $("#height_block").css(grid_style);

    // SocketIO namespace:
    namespace = "/test";

    // initiate SocketIO connection
    var socket = io.connect("http://" + document.domain + ":" + location.port + namespace);

    socket.on("connect", function () {
        socket.emit("browser connected", {data: "I'm connected"});
    });

    // Current active tab
    var active_tab = "Status";

    $("a.tab").click(function () {
        active_tab = $(this).text();
        console.log("Active tab = " + active_tab);
    });

    // Default values

    $("#mode_value").text("no link");
    $("#status_value").text("no link");
    $("#lon_value").text("0");
    $("#lat_value").text("0");
    $("#height_value").html("0");

    // Config FORM settings

    // input 1 type active form

    $("#input1_type").change(function () {
        createIOTypeForm("#input1_type", "#input1_type_parameters");
    });

    // input 2 type active form

    $("#input2_type").change(function () {
        createIOTypeForm("#input2_type", "#input2_type_parameters");
    });

    // output 1 type active form

    $("#output1_type").change(function () {
        createIOTypeForm("#output1_type", "#output1_type_parameters");
    });

    // output 2 type active form

    $("#output2_type").change(function () {
        createIOTypeForm("#output2_type", "#output2_type_parameters");
    });
    // This canvas contains the satellite_graph

    var canvas = $("#sat_chart_canvas");
    canvas.css("width", "99%");
    canvas.css("margin", "1%");

    var ctx = canvas.get(0).getContext("2d");

    // keep aspect ratio

    ctx.canvas.width = window.innerWidth;
    ctx.canvas.height = 0.5 * window.innerWidth;

    // change between-bar width depending on screen width

    var bar_spacing = (ctx.canvas.width > 1000) ? 5 : 2;

    // satellite_graph is created based on this data

    var sat_data = {
        labels: ["2", "4", "7", "10", "12", "14", "18", "20", "23", "31"],
        datasets: [
            {
                label: "Rover satellite levels",
                fillColor: "rgba(0, 255, 0, 1)",
                strokeColor: "rgba(0, 0, 0, 0.7)",
                data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            },
            {
                label: "Base satellite levels",
                fillColor: "rgba(151, 187, 205, 1)",
                strokeColor: "rgba(0, 0, 0, 0.7)",
                data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            }
        ]
    };

    // draw the satellite_graph

    var satellite_graph = new Chart(ctx).Bar(sat_data, {
        responsive: true,

        barDatasetSpacing: -1,
        barValueSpacing: bar_spacing,

        scaleOverride: true,
        scaleSteps: 6,
        scaleStepWidth: 10,
        scaleStartValue: 0,
        scaleLineColor: "rgba(0, 0, 0, 0.8)",
        scaleGridLineColor: "rgba(0, 0, 0, 0.7)",
        scaleShowVerticalLines: false,

        showTooltips: false
    });

    // handle data broadcast

    socket.on("my response", function (msg) {

    });

    socket.on("time broadcast", function (msg) {
        // check if the browser tab and app tab
        if ((active_tab == "Status") && (isActive == true)) {
            console.log("time msg received");
        }
    });

    socket.on("satellite broadcast", function (msg) {
        // check if the browser tab and app tab
        if ((active_tab == "Status") && (isActive == true)) {
            console.log("satellite msg received");

            // get all the keys of msg object
            var rover_count = 0;
            var base_count = 0;
            var fc = 0;

            // cycle through all the data of the incoming message
            for (var k in msg) {

                var msg_data = msg[k];

                // if this is a rover satellite level, then update the rover part of the satellite graph
                if (k.indexOf("rover") > -1) {

                    // var rover_number = k.charAt(5); // get satellite number for this value
                    satellite_graph.datasets[0].bars[rover_count].value = msg_data;

                    // take care of the fill color
                    switch (true) {
                        case (msg_data < 30):
                            fc = "rgba(255, 0, 0, 0.9)"; // Red
                            break;
                        case (msg_data >= 30 && msg_data <= 45):
                            fc = "rgba(255, 255, 0, 0.9)"; // Yellow
                            break;
                        case (msg_data >= 45):
                            fc = "rgba(0, 255, 0, 0.9)"; // Green
                            break;
                    }

                    satellite_graph.datasets[0].bars[rover_count].fillColor = fc;
                    rover_count++;
                }

                // if this is a base satellite level, update the base part of the satellite graph
                if (k.indexOf("base") > -1) {

                    // var base_number_ = k.charAt(4); // get satellite number for this value
                    satellite_graph.datasets[1].bars[base_count].value = msg_data;

                    // take care of the fill color
                    switch (true) {
                        case (msg_data < 30):
                            fc = "rgba(255, 0, 0, 1)"; // Red
                            break;
                        case (msg_data >= 30 && msg_data <= 45):
                            fc = "rgba(255, 255, 0, 1)"; // Yellow
                            break;
                        case (msg_data >= 45):
                            fc = "rgba(0, 255, 0, 1)"; // Green
                            break;
                    }
                    console.log("Color is " + fc + "Value is " + msg_data);

                    satellite_graph.datasets[1].bars[base_count].fillColor = fc;
                    base_count++;
                }
            }

            satellite_graph.update();
        }
    });

    socket.on("coordinate broadcast", function (msg) {
        // check if the browser tab and app tab
        if ((active_tab == "Status") && (isActive == true)) {
            console.log("coordinate msg received");

            // status
            $("#status_value").html("<span>" + msg.fix + "</span>");
            $("#mode_value").html("<span>" + msg.mode + "</span>");

            // coordinates
            $("#lon_value").html("<span>" + msg.lon.toFixed(8) + "</span>");
            $("#lat_value").html("<span>" + msg.lat.toFixed(8) + "</span>");
            $("#height_value").html("<span>" + msg.height.toFixed(8) + "</span>");
        }

    });
});
