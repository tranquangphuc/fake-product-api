const faker = require('faker/locale/vi');
let products = [];
let categories = ['Watersports', 'Soccer', 'Chess', 'Running'];
faker.seed(100); // make consistent results on restart
for (let i = 1; i < 503; i++) {
  let category = faker.helpers.randomize(categories);
  products.push({
    id: i,
    name: faker.commerce.productName(),
    category: category,
    description: faker.commerce.productDescription(),
    price: Number(faker.commerce.price()),
  });
}

module.exports = { categories, products, comments: [] };
