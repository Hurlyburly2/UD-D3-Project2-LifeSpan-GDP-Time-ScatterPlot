let margin = { top: 10, right: 10, bottom: 200, left: 100 }

let canvasWidth = 700 - margin.right - margin.left
let canvasHeight = 550 - margin.top - margin.bottom

let svg = d3.select('#chart-area').append('svg')
	.attr('width', canvasWidth + margin.right + margin.left)
	.attr('height', canvasHeight + margin.top + margin.bottom)
	
let graphGroup = svg.append('g')
	.attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')')

// X AXIS 
	
let x = d3.scaleLog()
	.range([0, canvasWidth])
	.base(2)	
	
let xAxisGroup = graphGroup.append('g')
	.attr('class', 'x-axis')
	.attr('transform', 'translate(0, ' + canvasHeight + ')')

// Y AXIS

let y = d3.scaleLinear()
	.range([canvasHeight, 0])
	
let yAxisGroup = graphGroup.append('g')
	.attr('class', 'y-axis')

// RADIUS

let radiusScale = d3.scaleLinear()
	.range([5 * Math.PI, 1500 * Math.PI])

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
			update(formattedData[currentYearIndex], maxLifeExpectancy, maxIncome, maxPopulation, lowestIncome, continents, lowestPopulation)
		} else {
			endDataTimer--
			if (endDataTimer == 0) {
				currentYearIndex = 0
			}
		}
	}, 100)
	update(formattedData[0], maxLifeExpectancy, maxIncome, maxPopulation, lowestIncome, continents, lowestPopulation)
	
}).catch(error => {
	console.log(error)
})

const update = (data, maxLifeExpectancy, maxIncome, maxPopulation, lowestIncome, continents, lowestPopulation) => {
	let t = d3.transition().duration(100)
	
	x.domain([lowestIncome - 50, maxIncome])
	y.domain([0, maxLifeExpectancy ])
	radiusScale.domain([lowestPopulation, maxPopulation])
	
	let xAxisCall = d3.axisBottom(x).tickValues([400, 4000, 40000])
	xAxisGroup.call(xAxisCall)
	
	let yAxisCall = d3.axisLeft(y)
	yAxisGroup.call(yAxisCall)
	
	let colors = d3.scaleOrdinal()
		.domain(continents.map((continent) => { return continent }))
		.range(d3.schemeCategory10)
	
	let circles = graphGroup.selectAll('circle')
		.data(data, (data) => { return data.country })
	
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
			.merge(circles)
			.transition(t)
				.attr('cx', (data) => { return x(data.income) })
				.attr('cy', (data) => { return y(data.life_exp) })
				.attr('r', (data) => { return Math.sqrt(radiusScale(data.population) / Math.PI) } )
		
}
