var readings

$.ajax({
  type: 'GET',
  url: 'https://pm25-api-server.herokuapp.com',
  dataType: 'json',
  success: function (data) {
    // this is async; nest d3 inside
    readings = data
    var centralData = data.filter(function (reading) {
      return reading.region === 'CE'
    })

    // set the dimensions and margins of the graph
    var margin = { top: 20, right: 20, bottom: 30, left: 50 },
      width = 960 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom

    var formatTime = d3.timeParse('%Y-%m-%dT%H:%M:%S')

    // set the ranges
    var x = d3.scaleTime().range([0, width])
    var y = d3.scaleLinear().range([height, 0])

    // append the svg obgect to the body of the page
    // appends a 'group' element to 'svg'
    // moves the 'group' element to the top left margin
    var svg = d3.select('body').append('svg')
                .attr('width', width + margin.left + margin.right)
                .attr('height', height + margin.top + margin.bottom)
                .append('g')
                .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

    for (var i = 0; i < centralData.length; i++) {
      var reading = centralData[i]
      reading.timestamp = formatTime(reading.timestamp.slice(0, -5).toString())
      reading.concentration = +reading.concentration
    }

    // define the line
    var valueline = d3.line()
                      .x(function (d) { return x(d.timestamp) })
                      .y(function (d) { return y(d.concentration) })

    // Scale the range of the data
    x.domain(d3.extent(centralData, function (d) { return d.timestamp }))
    y.domain([0, d3.max(centralData, function (d) { return d.concentration })])

    // Add the valueline path.
    svg.append('path')
        .data([centralData])
        .attr('class', 'line')
        .attr('d', valueline)

    // Add the X Axis
    svg.append('g')
        .attr('transform', 'translate(0,' + height + ')')
        .call(d3.axisBottom(x))

    // Add the Y Axis
    svg.append('g')
      .call(d3.axisLeft(y))
  }
})
