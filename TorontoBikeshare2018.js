
mapboxgl.accessToken = 'pk.eyJ1IjoiZGxtNTg5IiwiYSI6ImNrNTg5NmFrMjBjYWEzbm80dTk2bzVvcTQifQ.uSqt_zKktbLWt-5D9mIbSg';
var map = new mapboxgl.Map({
  container: 'map', // container element id
  style: 'mapbox://styles/dlm589/ck9wcq6600bls1ipaosht6v2o',
  center: [-79.3853,43.664],  // specify where the starting point is, longitude/latitude43° 39" 3.8520"" N and 79° 20" 49.2540"
  bearing: -18,
  zoom: 11.5
});

map.on('load', function() {
      map.addSource("bikeUsage_source",{
        "type": 'vector',
        "url": 'mapbox://dlm589.byy3kmxa' // replace this with the url of your own geojson
      });
      map.addLayer({
        "id": 'bike',
        "type": 'circle',
        "source" : "bikeUsage_source",
        "source-layer": "BikeUsage2018-dnklw4",
        "paint": {
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['to-number', ['get', 'BikeTrip_5']],
            10,2,
            50, 4,
            100, 6,
            150, 8,
            200, 14,
            400, 20,
            600, 24
          ],
          'circle-color': [
            'interpolate',
            ['linear'],
            ['to-number', ['get', 'BikeTrip_5']],
            0, '#d53e4f',
            5, '#fc8d59',
            10, '#fee08b',
            50, '#e6f598',
            100, '#99d594',
            500, '#3288bd'
          ],
          'circle-opacity': 0.8
        }
      });

      var day
      document.getElementById('filters').addEventListener('change', function(e) {
       day = e.target.value
        console.log(e.target.value)
        // update the map filter

        map.setFilter('bike', ['==', ['get', 'BikeTrip_4'], day]);
      });
      document.getElementById('slider').addEventListener('input', function(e) {
          var hour = parseInt(e.target.value);
          console.log("Hour is " + e.target.value);
          if (day == null)
          {
            var hourField = "Mon_" + hour;
            day = "Monday";
          }
          else {
            var hourField = day.slice(0,3) +"_" + hour;
          }
          // update the map
          map.setFilter('bike', ['==', ['get', 'BikeTrip_4'], hourField]);

          // converting 0-23 hour to AMPM format
          var ampm = hour >= 12 ? 'PM' : 'AM';
          var hour12 = hour % 12 ? hour % 12 : 12;

          // update text in the UI
          document.getElementById('active-hour').innerText = hour12 + ampm;
      });

});

// pop-up
var popup = new mapboxgl.Popup({
    closeButton: true,
    closeOnClick: false
  });
map.on("mouseenter","bike",function(e){
    map.getCanvas().style.cursor = "pointer"; //make the mouse cursor pointy
  });
map.on("mouseleave","bike",function(e){
    map.getCanvas().style.cursor = ""; //go back to the null cursor
  });

map.on("click", "bike", function(e){

    if (e.features.length > 0)
    {
      var features = map.queryRenderedFeatures(e.point, {
          "layers": ["bike"]}
      );
      console.log(features[0].length)
      if (features.length > 0){
          var feature = features[0]; //store the first element as 'feature'
          console.log("Clicked site is")
          popup.setLngLat(e.lngLat); //place the popup window at the lng and lat where your click event happened
          //add stuff to the pop up:
          popup.setHTML("<b>Station Name: </b> <br>" + feature.properties.StationD_1 + "<br>" + //station id
                        "<hr> " +
                        "<b>Station ID: </b> " + feature.properties.StationDat + "<br>"+
                        "<b>Capacity: </b> " + feature.properties.StationD_4 + "<br>" + //this is station capacity
                        "<b>Day: </b> " + feature.properties.BikeTrip_2 + " (whole year) <br>" +
                        "<b>Ride Count: </b> " + feature.properties.BikeTrip_5);
          popup.addTo(map); //finally add the pop up to the map
      }
        d3.selectAll('svg').remove();
      // ==============Create New Graph of the newly selected area ===================

        function property(e, p) {
          return parseInt(window.getComputedStyle(e, null).getPropertyValue(p));
        }
        var box = document.getElementById('console');
        var paddingTop = property(box, 'padding-top');
        var paddingBottom = property(box, 'padding-bottom');
        var paddingLeft = property(box, 'padding-left');
        var paddingRight = property(box, 'padding-right');
        var contentHeight = box.clientHeight;
        var contentWidth = box.clientWidth - paddingRight;
        var w = window.innerHeight;

        charting(features[0].properties.StationDat)

        async function getData(station)
        {
          var dataLists = [];
          const response = await fetch('https://dlm589.github.io/TorontoBikeShare/StationTable.csv');
          const data = await response.text(); //load the data as text
          const table = data.split('\n').slice(1); //makes each row as an element in the row list, header removed
          table.forEach(row =>{
            cols = row.split(','); // for each row split by commas
            if (Number(cols[0]) == station)
            {
              dataLists.push(cols)
            }
          })
          return dataLists
        }

        async function charting(station){
          var textList = await getData(station)
          var cols = [];
          textList[0].forEach(elmt=>{
            cols.push(parseInt(elmt, 10))
          })
          var k = 0; // this will be a variable dependent on the selected day of week

          //SET EACH LIST FOR THE BAR GRAPH
          var hourData = [
            cols[k+20],   cols[k+27], 	cols[k+34],  cols[k+41],
            cols[k+48],	  cols[k+55],	  cols[k+62],  cols[k+69],	cols[k+76],
            cols[k+83],	  cols[k+90],	  cols[k+97],	 cols[k+104],	cols[k+111],
            cols[k+118],  cols[k+125],	cols[k+132], cols[k+139],	cols[k+146],
            cols[k+153],	cols[k+160],	cols[k+167], cols[k+174],	cols[k+181]
          ];
          var monthData = [
            cols[8],	cols[9], cols[10],
            cols[11],	cols[12],cols[13],
            cols[14],	cols[15],cols[16],
            cols[17],	cols[18],	cols[19]
          ];
          var dayData = [
            cols[1],  cols[2],
            cols[3],  cols[4],
            cols[5],  cols[6],  cols[7]
          ];

          var margin = {top: 5, right: 0, bottom: 5, left: 10}
          var width = 2.5*contentWidth;
          var height= w -(contentHeight +paddingTop + paddingBottom) - 75 -margin.top - margin.bottom
          var dynamicColor;

          var yScale = d3.scaleLinear()
              .domain([0, d3.max(hourData)])
              .range([0, height])

          var xScale =  d3.scaleBand()
              .domain(d3.range(0, hourData.length))
              .range([0, width])

          var colors = d3.scaleLinear()
              .domain([0, hourData.length * .33, hourData.length * .66, hourData.length])
              .range(['#baf2bb', '#f2e2ba', '#f2bac9', '#baf2d8'])

          var chart = d3.select('#hourChart').append('svg')
              .attr('width', 50 + 'vw')
              .attr('height', height + 2*margin.top + 4*margin.bottom)
              .append('g')
              .attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')')
              .selectAll('rect').data(hourData)
              .enter().append('rect')
              .attr('fill', function(d, i){
                return colors(i);
              })
              .attr('fill-opacity', 0.6)
              .attr('stroke', function(d, i){
                return colors(i);
              })
              .attr('stroke-width',2)

              .attr('width', xScale.bandwidth()-5)
              .attr('x', function (data, i) {
                return xScale(i)-margin.left;
              })
              .attr('height', 0)
              .attr('y', height)

              .on('mouseover', function (data)
              {
                d3.select(this)
                .style('fill-opacity', 1)
              })
              .on('mouseout', function (data) {
                d3.select(this)
                .transition()
                .duration(150)
                .style('fill-opacity', 0.5)
              })
              chart
                  .append("title")
                 .text(function(d) {
                    return "Trip Count: " + d;
                 });
              chart.transition()
              .attr('height', function (data) {
                return yScale(data);
              })
              .attr('y', function (data) {
                return height - yScale(data);
              })
              .delay(function (data, i) {
                return i * 20;
              })
              .duration(500)

          var hAxis = d3.axisBottom(xScale)
              .tickFormat(function(d){
                return d;
              })
              .tickSize(3, 0)
              .ticks(hourData.size)


          var horizontalGuide = d3.select('svg').append('g')
              hAxis(horizontalGuide)
              horizontalGuide
              .attr('transform', 'translate(' + 0 + ', ' + (height + margin.top) + ')')
              .selectAll('text')
              .attr('fill', '#ffffff')
              .style('font-size', '14px')

          //=====================MONTHS=================================================================


          var margin = {top: 5, right: 0, bottom: 5, left: 0}
          var dynamicColor;
          var height= w -(contentHeight +paddingTop + paddingBottom) - 75 -margin.top - margin.bottom,
              width = contentWidth,
              barWidth = 20,
              barOffset = 20;
          var yScale = d3.scaleLinear()
              .domain([0, d3.max(monthData)])
              .range([0, height])

          var xScale = d3.scaleBand()
              .domain(d3.range(0, monthData.length))
              .range([0, contentWidth])

          var colors = d3.scaleLinear()
              .domain([0, monthData.length * .33, monthData.length * .66, monthData.length*.9])
              .range(["#b3e2cd","#fdcdac","#cbd5e8", "#f4cae4", "#e6f5c9", "#fff2ae", "#f1e2cc"])

          var chart = d3.select('#monthChart').append('svg')
              .attr('width', width)
              .attr('height', contentHeight)
              //.style('background', '#bce8f1')
              .append('g')
              .attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')')
              .selectAll('rect').data(monthData)
              .enter().append('rect')
              .attr('fill', function(d, i){
                return colors(i);
              })
              .attr('fill-opacity', 0.6)
              .attr('stroke', function(d, i){
                return colors(i);
              })
              .attr('stroke-width',2)
              .attr('width', xScale.bandwidth()-5)
              .attr('x', function (data, i) {
                return xScale(i)-margin.left;
              })
              .attr('height', 0)
              .attr('y', height)
              .on('mouseover', function (data)
              {
                d3.select(this)
                .style('fill-opacity', 1)
              })
              .on('mouseout', function (data) {
                d3.select(this)
                .transition()
                .duration(500)
                .style('fill-opacity', 0.5)
              })
              chart
                  .append("title")
                 .text(function(d) {
                    return "Trip Count: " + d;
                 });

          chart.transition()
          .attr('height', function (data) {
            return yScale(data);
          })
          .attr('y', function (data) {
            return height - yScale(data);
          })
          .delay(function (data, i) {
            return i * 20;
          })
          .duration(500)


          var dayOfWeek = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
          var hAxis = d3.axisBottom(xScale)
          .tickFormat(function(d){
            return dayOfWeek[d]
          })
          .tickSize(3, 0)
          .ticks(monthData.size)

          var horizontalGuide = d3.select('svg').append('g')
          hAxis(horizontalGuide)
          horizontalGuide
          .attr('transform', 'translate(' + 0 + ', ' + (height + margin.top) + ')')
          .selectAll('text')
          .attr('fill', '#ffffff')
          .style('font-size', '14px')

          //==================THIS IS FOR WEEKDAY ======================================
          var margin = {top: 5, right: 0, bottom: 5, left: 0}

          var height= w -(contentHeight +paddingTop + paddingBottom) - 75 -margin.top - margin.bottom,
          width = contentWidth,
          barWidth = 20,
          barOffset = 20;

          var dynamicColor;

          var yScale = d3.scaleLinear()
          .domain([0, d3.max(dayData)])
          .range([0, height])

          var xScale = d3.scaleBand()
          .domain(d3.range(0, dayData.length))
          .range([0, contentWidth])

          var colors = d3.scaleLinear()
          .domain([0, dayData.length * 1/7, dayData.length * 2/7, dayData.length*3/7,
            dayData.length * 4/7, dayData.length * 5/7, dayData.length*6/7,dayData.length])
            .range(["#b2182b","#ef8a62","#fddbc7","#f7f7f7","#d1e5f0","#67a9cf","#2166ac"])

            var chart = d3
            .select('#weekDayChart')
            .append('svg')
            .attr('width', 100 +'vw' )
            .attr('height', height + 2*margin.top + 4*margin.bottom)
            //.style('background', '#bce8f1')
            .append('g')
            .attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')')
            .selectAll('rect')
            .data(dayData)
            .enter()
            .append('rect')
            .attr('fill', function(d, i){
              return colors(i);
            })
            .attr('fill-opacity', 0.6)
            .attr('stroke', function(d, i){
              return colors(i);
            })
            .attr('stroke-width',2)

            .attr('width', xScale.bandwidth()-5)
            .attr('x', function (data, i) {
              return xScale(i)-margin.left;
            })
            .attr('height', 0)
            .attr('y', height)
            .on('mouseover', function (data)
            {
              d3.select(this)
              .transition()
              .duration(100)
              .style('fill-opacity', 1)
            })
            .on('mouseout', function (data) {
              d3.select(this)
              .transition()
              .duration(500)
              .style('fill-opacity', 0.5)
            })

            chart
              .append("title")
              .text(function(d) {
                  return "Trip Count: " + d;
               });

            chart.transition()
            .attr('height', function (data) {
              return yScale(data);
            })
            .attr('y', function (data) {
              return height - yScale(data);
            })
            .delay(function (data, i) {
              return i * 20;
            })
            .duration(500)


            dayOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
            var hAxis = d3.axisBottom(xScale)
            .tickFormat(function(d){
              return dayOfWeek[d]
            })
            .tickSize(3, 0)
            .ticks(dayData.size)


            var horizontalGuide = d3.select('svg').append('g')
            hAxis(horizontalGuide)
            horizontalGuide
            .attr('transform', 'translate(' + 0 + ', ' + (height + margin.top) + ')')
            .selectAll('text')
            .attr('fill', '#ffffff')
            .style('font-size', '14px')
            chart
            .on('mouseover', function (data)
            {
              d3.select(this)
                .transition()
                .duration(100)
                .style('fill-opacity', 1)

            })
            .on('mouseout', function (data) {
                d3.select(this)
                  .transition()
                  .duration(500)
                  .style('fill-opacity', 0.5)
            })
          }


  //if there is a feature there, do the following


    }
});

//hiistograms
