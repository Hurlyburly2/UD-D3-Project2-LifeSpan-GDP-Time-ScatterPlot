let margin = { top: 10, right: 10, bottom: 200, left: 100 }

let canvasWidth = 700 - margin.right - margin.left
let canvasHeight = 550 - margin.top - margin.bottom

let svg = d3.select('#chart-area').append('svg')
	.attr('width', canvasWidth + margin.right + margin.left)
	.attr('height', canvasHeight + margin.top + margin.bottom)
	
let graphGroup = svg.append('g')
	.attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')')

// Tooltip

let tip = d3.tip().attr('class', 'd3-tip')
	.html((data) => {
		let text = "<string>Country:</strong> <span style='color:red'>" + data.country + "</span><br>"
		text += "<strong>Continent:</strong> <span style='color:red;text-transform:capitalize'>" + data.continent + "</span><br>"
		text += "<strong>Life Expectancy:</strong> <span style='color:red'>" + d3.format(".2f")(data.life_exp) + "</span><br>"
		text += "<strong>GDP Pet Capita:</strong> <span style='color:red'>" + d3.format("$,.0f")(data.income) + "</span><br>"
		text += "<strong>Population:</strong> <span style='color:red'>" + d3.format(",.0f")(data.population) + "</span><br>"
		return text
	})
graphGroup.call(tip)

// LEGEND

let continents = ["europe", "asia", "americas", "africa"]

let colors = d3.scaleOrdinal()
	.domain(continents.map((continent) => { return continent }))
	.range(d3.schemeCategory10)

let legend = graphGroup.append('g')
	.attr('transform', 'translate(' + (canvasWidth - 10) + "," + (canvasHeight - 125)+ ')')
	
continents.forEach((continent, index) => {
	let legendRow = legend.append('g')
		.attr('transform', 'translate(0, ' + (index * 20) + ')')		// offsets each row of the legend so they appear on top of each other
		
	legendRow.append('rect')
		.attr('width', 10)
		.attr('height', 10)
		.attr('fill', colors(continent))
		
	legendRow.append('text')
		.attr('x', -10)
		.attr('y', 10)
		.attr('text-anchor', 'end')
		.style('text-transform', 'capitalize')		// Style sets CSS styles (some styles CANNOT be attributes)
		.text(continent)
})

// X AXIS 
	
let x = d3.scaleLog()
	.range([0, canvasWidth])
	.base(2)	
	
let xAxisGroup = graphGroup.append('g')
	.attr('class', 'x-axis')
	.attr('transform', 'translate(0, ' + canvasHeight + ')')
	
graphGroup.append('text')
	.attr('class', 'x-axis-label')
	.attr('x', canvasWidth / 2)
	.attr('y', canvasHeight + 40)
	.attr('text-anchor', 'middle')
	.style('font-size', '20px')
	.text('Average Income')

// Y AXIS

let y = d3.scaleLinear()
	.range([canvasHeight, 0])
	
let yAxisGroup = graphGroup.append('g')
	.attr('class', 'y-axis')
	
graphGroup.append('text')
	.attr('class', 'y-axis-label')
	.attr('x', -(canvasHeight / 2))
	.attr('y', -40)
	.attr('text-anchor', 'middle')
	.style('font-size', '20px')
	.attr('transform', 'rotate(-90)')
	.text('Average Age')

// RADIUS

let radiusScale = d3.scaleLinear()
	.range([5 * Math.PI, 1500 * Math.PI])
	
// YEAR LABEL

let yearLabel = graphGroup.append("text")
	.attr("class", "year-label")
	.attr('x', canvasWidth -30)
	.attr('y', canvasHeight - 20)
	.attr('text-anchor', 'middle')
	.style('font-size', '20px')
	.text("")

d3.json("data/data.json").then(data => {
	
	let maxLifeExpectancy = 0
	let maxIncome = 0
	let maxPopulation = 0
	let lowestIncome = 1000000000
	let continents = []
	let currentYearIndex = 0
	let endDataTimer = 0
	let formattedData = []
	let lowestPopulation = 10000000
	let years = []
	
	data.forEach(year => {
		formattedData.push(year.countries.filter((country) => {
			if (country.continent != null && country.country != null && country.income != null && country.life_exp != null && country.population != null) {
				return true
			}
			return false
		}))
		year.countries.forEach((country) => {
			country.life_exp = parseInt(country.life_exp)
			country.income = parseInt(country.income)
			country.population = parseInt(country.population)
			if (country.life_exp > maxLifeExpectancy) { maxLifeExpectancy = country.life_exp }
			if (country.income > maxIncome) { maxIncome = country.income }
			if (country.income < lowestIncome) { lowestIncome = country.income }
			if (country.population > maxPopulation) { maxPopulation = country.population }
			if (country.population < lowestPopulation) { lowestPopulation = country.population }
			if (!continents.includes(country.continent)) {
				continents.push(country.continent)
			}
		})
		year.year = parseInt(year.year)
		years.push(year.year)
	})
	
	d3.interval(() => {
		if (endDataTimer == 0) {
			currentYearIndex++
			if (currentYearIndex == years.length) {
				endDataTimer = 20
			}
			update(formattedData[currentYearIndex], maxLifeExpectancy, maxIncome, maxPopulation, lowestIncome, continents, lowestPopulation, years[currentYearIndex])
		} else {
			endDataTimer--
			if (endDataTimer == 0) {
				currentYearIndex = 0
			}
		}
	}, 100)
	update(formattedData[0], maxLifeExpectancy, maxIncome, maxPopulation, lowestIncome, continents, lowestPopulation, years[currentYearIndex])
	
}).catch(error => {
	console.log(error)
})

const update = (data, maxLifeExpectancy, maxIncome, maxPopulation, lowestIncome, continents, lowestPopulation, currentYear) => {
	let t = d3.transition().duration(100)
	
	x.domain([lowestIncome - 50, maxIncome])
	y.domain([0, maxLifeExpectancy ])
	radiusScale.domain([lowestPopulation, maxPopulation])
	
	let xAxisCall = d3.axisBottom(x).tickValues([400, 4000, 40000])
		.tickFormat((label) => {
			return ("$" + label)
		})
	xAxisGroup.call(xAxisCall)
	
	let yAxisCall = d3.axisLeft(y)
	yAxisGroup.call(yAxisCall)
	
	let circles = graphGroup.selectAll('circle')
		.data(data, (data) => { return data.country })
	
	yearLabel.text(currentYear)
	
	circles.exit()
		.attr('class', 'exit')
		.remove()
		
	circles.enter()
		.append('circle')
			.attr('class', 'enter')
			.attr('cx', (data) => { return x(data.income) })
			.attr('cy', (data) => { return y(data.life_exp) })
			.attr('r', (data) => { return Math.sqrt(radiusScale(data.population) / Math.PI) } )
			.attr('fill', (data) => { return colors(data.continent) })
			.on('mouseover', tip.show)
			.on('mouseout', tip.hide)
			.merge(circles)
			.transition(t)
				.attr('cx', (data) => { return x(data.income) })
				.attr('cy', (data) => { return y(data.life_exp) })
				.attr('r', (data) => { return Math.sqrt(radiusScale(data.population) / Math.PI) } )
		
}
