let margin = { top: 10, right: 10, bottom: 200, left: 100 }

let canvasWidth = 700 - margin.right - margin.left
let canvasHeight = 550 - margin.top - margin.bottom

let svg = d3.select('#chart-area').append('svg')
	.attr('width', canvasWidth + margin.right + margin.left)
	.attr('height', canvasHeight + margin.top + margin.bottom)
	
let graphGroup = svg.append('g')
	.attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')')
	
let x = d3.scaleLog()
	.range([0, canvasWidth])
	.base(5)
	
let y = d3.scaleLinear()
	.range([canvasHeight, 0])

d3.json("data/data.json").then(data => {
	
	data.forEach(year => {
		year.countries = year.countries.filter((country) => {
			if (country.continent != null && country.country != null && country.income != null && country.life_exp != null && country.population != null) {
				return true
			}
			return false
		})
		year.countries.forEach((country) => {
			country.income = parseInt(country.income)
			country.life_exp = parseInt(country.life_exp)
			country.population = parseInt(country.population)
		})
		year.year = parseInt(year.year)
	})
	
	// d3.interval(() => {
	// 	update(data)
	// }, 500)
	update(data[0])
	
}).catch(error => {
	console.log(error)
})

const update = (data) => {
	let countries = data.countries
	
	x.domain(countries.map((country) => { return country.income }))
	y.domain([0, d3.max(countries, (country) => { return country.life_exp })])
	
	let points = graphGroup.selectAll('circle')
		// .data(countries, (country) => { return country.income })
}
