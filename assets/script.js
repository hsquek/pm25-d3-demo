/* globals d3 $ getRegionalData */

// add helpers
var imported = document.createElement('script')
imported.src = 'assets/helpers/helpers.js'
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

    // format dataset -- timestamp and concentration
    for (var i = 0; i < dataset.length; i++) {
      var reading = dataset[i]
      reading.timestamp = formatTime(reading.timestamp.slice(0, -5).toString())
      reading.concentration = +reading.concentration
    }

    // set the ranges
    var x = d3.scaleTime().range([0, width])
    var y = d3.scaleLinear().range([height, 0])

    // Scale the range of the data to the relevant axis
    x.domain(d3.extent(dataset, function (d) { return d.timestamp })).nice(d3.timeDay, 1)
    y.domain([0, d3.max(dataset, function (d) { return d.concentration })]).nice()

    // create axes
    var xAxis = d3.axisBottom(x)
    var yAxis = d3.axisLeft(y)

    // create buttons
    for (var j = 0; j < regions.length; j++) {
      d3.select('.regionSelect')
        .append('button')
        .text(regionDictionary[regions[j]])
        .attr('value', regions[j])
        .attr('id', regions[j])
        .data([getRegionalData(dataset, regions[j])])
    }

    // draw chart
    function drawCharts () {
  // append the svg object to the body of the page
  // appends a 'group' element to 'svg'
  // moves the 'group' element to the top left margin
      var lineChart = d3.select('body')
                        .append('svg')
                        .attr('width', width + margin.left + margin.right)
                        .attr('height', height + margin.top + margin.bottom)
                        .append('g')
                        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

  // add title to chart
      lineChart.append('text')
                .attr('x', (width / 2))
                .attr('y', 0)
                .attr('text-anchor', 'middle')
                .style('font-size', '20px')
                .style('text-decoration', 'underline')
                .text('1-hour PM2.5 concentrations in Singapore')

  // define the line
      var valueline = d3.line()
                        .x(function (d) { return x(d.timestamp) })
                        .y(function (d) { return y(d.concentration) })

  // Add the valueline path.
      lineChart.append('path')
                .attr('class', 'line')
                .attr('d', valueline(getRegionalData(dataset, 'WE')))

    // Add the X Axis
      lineChart.append('g')
        .attr('transform', 'translate(0,' + height + ')')
        .call(xAxis)

    // Add the Y Axis
      lineChart.append('g')
      .call(yAxis)

      // this sets the concentration gradient for color (proxy for pm2.5 density)
      var colorScale = d3.scaleLinear().domain([0, 500]).range(['#ffffff', '#000000'])

      // set container for scatterplot
      var scatter = d3.select('body')
                      .append('svg')
                      .attr('width', width + margin.left + margin.right)
                      .attr('height', height + margin.top + margin.bottom)
                      .append('g')
                      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

      scatter.append('g')
              .call(xAxis)
              .attr('transform', 'translate(0,' + height + ')')

      scatter.append('g')
              .call(yAxis)

      scatter.selectAll('.dot')
              .data(getRegionalData(dataset, 'WE'))
              .enter().append('circle')
              .attr('class', 'dot')
              .attr('r', function (d) { return d.concentration / 8 })
              // .attr('r', 4)
              .attr('cx', function (d) { return x(d.timestamp) })
              .attr('cy', function (d) { return y(d.concentration) })
              .style('fill', function (d) { return colorScale(d.concentration) })

      // draw psiClock
      var sampleData = getRegionalData(dataset, 'WE').slice(-12)
      sampleData[0].concentration = null
      var radius = height / 2 - 10

      var arc = d3.arc()
                  .innerRadius(radius - 40)
                  .outerRadius(radius)

      var pie = d3.pie()
                  .padAngle(0.02)
                  .value(function (d) { return Math.PI / 6 })
                  .sort(function (a, b) {
                    return a.timestamp.getHours() % 12 - b.timestamp.getHours() % 12
                  })

      var psiClock = d3.select('body')
                        .append('svg')
                        .attr('width', width)
                        .attr('height', height)
                        .attr('class', 'psiClock')
                        .append('g')
                        .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')')

      psiClock.selectAll('path')
                .data(pie(sampleData))
                .enter().append('path')
                .style('fill', function (d, i) {
                  return colorScale(d.data.concentration)
                })
                .attr('d', arc)
                // .attr('class', 'arc')
                .each(function (d) {
                  if (d.index === sampleData.length - 1) {
                    d3.select(this)
                      .attr('class', 'last')
                  }
                })

      psiClock.selectAll('text')
              .data(pie(sampleData))
              .enter()
              .append('text')
              .each(function (d) {
                var centroid = arc.centroid(d)
                d3.select(this)
                  .attr('x', centroid[0])
                  .attr('y', centroid[1])
                  .attr('dy', '0.33em')
                  .text((d.data.timestamp.getHours() % 12 === 0 ? 12 : d.data.timestamp.getHours() % 12) + ' o\'clock, ' + d.data.concentration)
              })
              .attr('class', 'clockIndicators')

      for (var i = 0; i < regions.length; i++) {
        d3.select('#' + regions[i]).on('click', function (datum) {
          var halfDayData = datum.slice(-12)
          halfDayData[0].concentration = null
          d3.select('.line').transition().attr('d', valueline(datum))

          d3.selectAll('circle').data(datum).transition()
                      .attr('r', function (d) { return d.concentration / 8 })
                      .attr('cx', function (d) { return x(d.timestamp) })
                      .attr('cy', function (d) { return y(d.concentration) })

          d3.selectAll('.arc').data(pie(halfDayData))
            .attr('d', arc)
            .transition()
            .style('fill', function (d, i) {
              return colorScale(d.data.concentration)
            })
            .each(function (d) {
              if (d.index === halfDayData.length - 1) {
                d3.select(this)
                  .attr('class', 'last')
              }
            })

          d3.selectAll('.clockIndicators').data(pie(halfDayData)).transition()
            .each(function (d) {
              var centroid = arc.centroid(d)
              d3.select(this)
                .attr('x', centroid[0])
                .attr('y', centroid[1])
                .attr('dy', '0.33em')
                .text((d.data.timestamp.getHours() % 12 === 0 ? 12 : d.data.timestamp.getHours() % 12) + ' o\'clock, ' + d.data.concentration)
            })
            // .attr('class', 'clockIndicators')
        })
      }
    }

    drawCharts()

    function drawPSIclock () {
      var sampleData = getRegionalData(dataset, 'WE').slice(-12)
      sampleData[0].concentration = null

      var width = 960
      var height = 500
      var radius = height / 2 - 10

      var color = d3.scaleLinear().domain([0, 500]).range(['#ffffff', '#000000'])

      var arc = d3.arc()
                  .innerRadius(radius - 40)
                  .outerRadius(radius)

      var pie = d3.pie()
                .padAngle(0.02)
                .value(function (d) { return Math.PI / 6 })
                .sort(function (a, b) {
                  return a.timestamp.getHours() % 12 - b.timestamp.getHours() % 12
                })

      var psiClock = d3.select('body').append('svg')
                        .attr('width', width)
                        .attr('height', height)
                        .append('g')
                        .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')')

      psiClock.selectAll('path')
                .data(pie(sampleData))
                .enter().append('path')
                .style('fill', function (d, i) {
                  return color(d.data.concentration)
                })
                .attr('d', arc)
                // .attr('class', 'arc')

      psiClock.selectAll('text')
              .data(pie(sampleData))
              .enter()
              .append('text')
              .each(function (d) {
                var centroid = arc.centroid(d)
                d3.select(this)
                  .attr('x', centroid[0])
                  .attr('y', centroid[1])
                  .attr('dy', '0.33em')
                  .text((d.data.timestamp.getHours() % 12 === 0 ? 12 : d.data.timestamp.getHours() % 12) + ' o\'clock, ' + d.data.concentration)
              })
    }

    // drawPSIclock()
  }
})
