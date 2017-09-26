/* globals d3 $ getRegionalData */

// add helpers
var imported = document.createElement('script')
imported.src = 'assets/helpers/getRegionalData.js'
document.head.appendChild(imported)

var regions = ['CE', 'NO', 'SO', 'EA', 'WE']
var regionDictionary = {
  'CE': 'Central',
  'NO': 'North',
  'SO': 'South',
  'EA': 'East',
  'WE': 'West'
}

$.ajax({
  type: 'GET',
  url: 'https://pm25-api-server.herokuapp.com',
  dataType: 'json',
  success: function (data) {
    // this is async; nest d3 inside
    var dataset = data

    // set the dimensions and margins of the graph
    var margin = { top: 20, right: 20, bottom: 30, left: 50 }
    var width = 960 - margin.left - margin.right
    var height = 500 - margin.top - margin.bottom

    var formatTime = d3.timeParse('%Y-%m-%dT%H:%M:%S')

    // set the ranges
    var x = d3.scaleTime().range([0, width])
    var y = d3.scaleLinear().range([height, 0])

    // format dataset -- timestamp and concentration
    for (var i = 0; i < dataset.length; i++) {
      var reading = dataset[i]
      reading.timestamp = formatTime(reading.timestamp.slice(0, -5).toString())
      reading.concentration = +reading.concentration
    }

    // create buttons

    for (var j = 0; j < regions.length; j++) {
      d3.select('body').append('button').text(regionDictionary[regions[j]])
        .attr('value', regions[j])
        .attr('id', regions[j])
        .data([getRegionalData(dataset, regions[j])])
    }

    // draw chart
    function drawChart () {
  // append the svg object to the body of the page
  // appends a 'group' element to 'svg'
  // moves the 'group' element to the top left margin
      var svg = d3.select('body').append('svg')
              .attr('width', width + margin.left + margin.right)
              .attr('height', height + margin.top + margin.bottom)
              .append('g')
              .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

  // add title to chart
  svg.append("text")
        .attr("x", (width / 2))
        .attr("y", 0)
        .attr("text-anchor", "middle")
        .style("font-size", "20px")
        .style("text-decoration", "underline")
        .text("1-hour PM2.5 concentrations in Singapore");

  // define the line
      var valueline = d3.line()
                    .x(function (d) { return x(d.timestamp) })
                    .y(function (d) { return y(d.concentration) })

  // Scale the range of the data
      x.domain(d3.extent(dataset, function (d) { return d.timestamp })).nice(d3.timeDay, 1)
      y.domain([0, d3.max(dataset, function (d) { return d.concentration })]).nice() // make this nice

  // Add the valueline path.
      svg.append('path')
      // .data([getRegionalData(dataset, 'WE')])
      .attr('class', 'line')
      .attr('d', valueline(getRegionalData(dataset, 'WE')))

      // .data([getRegionalData(dataset, 'WE')]) is the same as .attr('d', valueline(getRegionalData(dataset, 'WE')))

    // Add the X Axis
      svg.append('g')
        .attr('transform', 'translate(0,' + height + ')')
        .call(d3.axisBottom(x).ticks(d3.timeDay.every(1)))

    // Add the Y Axis
      svg.append('g')
      .call(d3.axisLeft(y))

      for (var i = 0; i < regions.length; i++) {
        d3.select('#' + regions[i]).on('click', function (datum) {
          d3.select('path').attr('d', valueline(datum))
        })
      }
    }

    drawChart()

    // make a circle
    function drawCircles () {

    }
  }
})
