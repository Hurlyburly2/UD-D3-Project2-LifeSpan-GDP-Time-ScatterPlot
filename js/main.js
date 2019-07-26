let margin = { top: 10, right: 10, bottom: 200, left: 100 }

let canvasWidth = 700 - margin.right - margin.left
let canvasHeight = 550 - margin.top - margin.bottom

let svg = d3.select('#chart-area').append('svg')
	.attr('width', canvasWidth + margin.right + margin.left)
	.attr('height', canvasHeight + margin.top + margin.bottom)
	
let graphGroup = svg.append('g')
	.attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')')
	
let xAxisGroup = graphGroup.append('g')
	.attr('class', 'x-axis')
	.attr('transform', 'translate(0, ' + canvasHeight + ')')
	
let x = d3.scaleLog()
	.range([0, canvasWidth])
	.base(2)
	
let yAxisGroup = graphGroup.append('g')
	.attr('class', 'y-axis')
	
let y = d3.scaleLinear()
	.range([canvasHeight, 0])

d3.json("data/data.json").then(data => {
	
	let maxLifeExpectancy = 0
	let maxIncome = 0
	let maxPopulation = 0
	let lowestIncome = 1000000000
	let continents = []
	
	data.forEach(year => {
		year.countries = year.countries.filter((country) => {
			if (country.continent != null && country.country != null && country.income != null && country.life_exp != null && country.population != null) {
				return true
			}
			return false
		})
		year.countries.forEach((country) => {
			country.life_exp = parseInt(country.life_exp)
			country.income = parseInt(country.income)
			country.population = parseInt(country.population)
			
			if (country.life_exp > maxLifeExpectancy) { maxLifeExpectancy = country.life_exp }
			if (country.income > maxIncome) { maxIncome = country.income }
			if (country.income < lowestIncome) { lowestIncome = country.income }
			if (country.population > maxPopulation) { maxPopulation = country.population }
			
			if (!continents.includes(country.continent)) {
				continents.push(country.continent)
			}
			
		})
		year.year = parseInt(year.year)
	})
	
	// d3.interval(() => {
	// 	update(data)
	// }, 500)
	update(data[0], maxLifeExpectancy, maxIncome, maxPopulation, lowestIncome, continents)
	
}).catch(error => {
	console.log(error)
})

const update = (data, maxLifeExpectancy, maxIncome, maxPopulation, lowestIncome, continents) => {
	let countries = data.countries
	
	x.domain([lowestIncome - 50, maxIncome])
	y.domain([0, maxLifeExpectancy ])
	
	let xAxisCall = d3.axisBottom(x).tickValues([400, 4000, 40000])
	xAxisGroup.call(xAxisCall)
	
	let yAxisCall = d3.axisLeft(y)
	yAxisGroup.call(yAxisCall)
	
	let colors = d3.scaleOrdinal()
		.domain(continents.map((continent) => { return continent }))
		.range(d3.schemeCategory10)
	
	let points = graphGroup.selectAll('circle')
		.data(countries, (country) => { return country.income })
		
	points.enter()
		.append('circle')
			.attr('cx', (country) => { return x(country.income) })
			.attr('cy', (country) => { return y(country.life_exp) })
			.attr('r', 5 )
			.attr('fill', (country) => { return colors(country.continent) })
		
}
