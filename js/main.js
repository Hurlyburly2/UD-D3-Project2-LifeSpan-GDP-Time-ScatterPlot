let margin = { top: 10, right: 10, bottom: 200, left: 100 }

let canvasWidth = 700 - margin.right - margin.left
let canvasHeight = 550 - margin.top - margin.bottom

let svg = d3.select('#chart-area').append('svg')
	.attr('width', canvasWidth + margin.right + margin.left)
	.attr('height', canvasHeight + margin.top + margin.bottom)
	
let graphGroup = svg.append('g')
	.attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')')

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
		year.year = parseInt(year)
	})
	
	d3.interval(() => {
		update(data)
	}, 500)
	update(data)
	
}).catch(error => {
	console.log(error)
})

const update = (data) => {
	let points = graphGroup.selectAll('rect')
		.data(data, (data) => { return data.year })
	
	points.enter()
		.append('rect')
		.attr('x', 0)
		.attr('y', 0)
		.attr('width', canvasWidth)
		.attr('height', canvasHeight)
		.attr('fill', 'grey')
}
