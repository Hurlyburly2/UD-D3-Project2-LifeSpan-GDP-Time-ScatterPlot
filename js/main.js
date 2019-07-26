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
	
}).catch(error => {
	console.log(error)
})
