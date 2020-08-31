# Tạo Rest API giả với Express, json-server, faker.js

## A. Giới thiệu

Trong bài này mình dựng Rest API cho phép client duyệt products và comment sản phẩm.

Các bước thực hiện: đầu tiên là dùng faker để sinh ra dữ liệu giả, sau đó dùng json-server để tìm kiếm products và thêm/sửa/xóa comments.

Trước hết mình xin giới thiệu hai thư viện sẽ dùng:

### 1. [JSON server](https://github.com/typicode/json-server)

Chuyên tạo Rest API giả với đầy đủ các tính năng chỉ trong 30 giây:

- `GET` hết `/products`
- `GET` một `/products/1`
- `POST` thêm `/products`
- `PUT` thay thế `/products/1`
- `PATCH` vá `/products/1`
- `DELETE` xóa `/products/1`
- Tìm kiếm: filter, full-text search
- Phân trang: paginate, slice
- Sắp xếp: sort, order
- Quan hệ: `/products/1/comments`

Được host free tại [JSONPlaceholder](https://jsonplaceholder.typicode.com/), [My JSON Server](https://my-json-server.typicode.com/)

### 2. [faker.js](https://github.com/Marak/Faker.js)

Dùng để random dữ liệu với số lượng cực lớn:

- Đầy để loại thông tin:
  - address: 20+ loại
  - commerce: 8 loại
  - company: 10+ loại
  - database: 4 loại
  - date: 7 loại
  - image: 20 loại
  - và vô số loại thông tin khác.
- Tùy chọn nhiều vùng miền, có cả Việt Nam

[Demo](https://rawgit.com/Marak/faker.js/master/examples/browser/index.html)

## B. Các bước thực hiện

### 1. Tạo Project

```sh
npm init fake-product-api
cd fake-product-api
npm install faker json-server
```

### 2. Dùng faker để sinh dữ liêu giả

Tạo file `data.js`:

```javascript
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
```

Quá trình tạo dữ liệu giả đã xong, để sử dụng chúng ta chỉ cần import file `data.js` là được.

### 2. Dùng json-server để tạo Rest API

Tạo file `index.js`:

```javascript
const express = require('express');
const jsonServer = require('json-server');
const fileName = process.argv[2] || './data.js';
const data = fileName.endsWith('.js') ? require(fileName) : fileName;
const port = process.argv[3] || 40400;

const app = express();
const router = jsonServer.router(data);
const middlewares = jsonServer.defaults();

// Set default middlewares (logger, static, cors and no-cache)
app.use(middlewares);

// To handle POST, PUT and PATCH you need to use a body-parser
// You can use the one used by JSON Server
app.use(jsonServer.bodyParser);

app.use('/api', router);

app.listen(port, () =>
  console.log(`Fake Product API: http://localhost:${port}/api/db`)
);
```

Như vậy là chúng ta đã có API giả. Trong đó categories và products đã được `faker.js` sinh sẵn, còn comments thì mình sẽ dùng API do json-server cung cấp để thêm sau.

Để xem toàn bộ dữ liệu hiện tại truy cập vào link log trong console.

### 3. Dùng json-server API để Tìm kiếm products

Dựa vào dữ liệu sinh ra có dạng `{ categories, products, comments: [] }` và `json-server` được route bởi `/api`, mình sẽ dùng các API sau để query products và thêm/sửa/xóa comments, ngoài ra còn có các API tương tự mà mình không liệt kê.

- `GET /api/categories`: tìm tất cả categories
- `GET /api/products`: tìm tất cả products
- `GET /api/products/1`: tìm product có `id` bằng `1`
- `GET /api/products/1/comments`: tìm tất cả comments của product 1
- `POST /api/products/1/comments`: thêm comment cho product 1
- `GET /api/comments/1`: tìm comment 1
- `PATCH /api/comments/1`: vá comment 1
- `DELETE /api/comments/1`: xóa comment 1

#### Routes:

Liệt kê tất cả product:

```sh
curl "localhost:40400/api/products"
```

```json
[
  {
    "id": 1,
    "name": "Handcrafted Plastic Shirt",
    "category": "Chess",
    "description": "The Nagasaki Lander is the trademarked name of several series of Nagasaki sport bikes, that started with the 1984 ABC800J",
    "price": 527
  },
  {
    "id": 2,
    "name": "Rustic Steel Keyboard",
    "category": "Running",
    "description": "The automobile layout consists of a front-engine design, with transaxle-type transmissions mounted at the rear of the engine and four wheel drive",
    "price": 187
  }
  // 500 products còn lại
]
```

Tìm product có `id` bằng `1`:

```sh
curl "localhost:40400/api/products/1"
```

```json
{
  "id": 1,
  "name": "Handcrafted Plastic Shirt",
  "category": "Chess",
  "description": "The Nagasaki Lander is the trademarked name of several series of Nagasaki sport bikes, that started with the 1984 ABC800J",
  "price": 527
}
```

#### Filter: Tìm theo properties có đúng giá trị

```sh
# Tìm products thuộc category Chess
curl "localhost:40400/api/products/?category=Chess"
```

#### Dùng `_lte` và `_gte` để tìm khoản giá trị:

```sh
# Tìm products có giá từ 500 trở xuống
curl "localhost:40400/api/products/?price_lte=500"
```

#### Dùng `_like` filter để tìm theo RegExp:

```sh
# Tìm products có name chứa ký tự keyboard
curl "localhost:40400/api/products/?name_like=keyboard"
```

#### Fulltext search dùng `q`:

```sh
curl "localhost:40400/api/products/?q=keyboard"
```

#### Dùng param `_page` và `_limit` để phân trang:

```sh
curl "localhost:40400/api/products/?_page=1&_limit=20"
```

reponse header có:

- `Link`: liên kết tới `first`, `prev`, `next`, `last` page
- `X-Total-Count`: tổng số items được tìm thấy (Note: tổng số trang=`X-Total-Count/_limit`)

Dùng `_sort` (danh sách thuộc tính) và `_order` (`asc`/`desc` cho mỗi thuộc tính được sort)

### Tạo comments

#### Thêm 4 comments cho product 1:

```sh
curl -X POST localhost:40400/api/products/1/comments -H "Content-Type: application/json" -d @- <<EOF
{
  "user": "phuong",
  "body": "kết quả minigame công bố chưa QTV?"
}
EOF
curl -X POST localhost:40400/api/products/1/comments -H "Content-Type: application/json" -d @- <<EOF
{
  "user": "manh hung",
  "body": "Chào anh, Dạ thời gian công bố kết quả mini Game dự kiến sẽ trước 17h ngày 31/08/2020 ạ. Anh có thể vui lòng chờ thêm giúp em anh nhé. Xin thông tin đến anh !"
}
EOF
curl -X POST localhost:40400/api/products/1/comments -H "Content-Type: application/json" -d @- <<EOF
{
  "user": "duy",
  "body": "Giá chát quá"
}
EOF
curl -X POST localhost:40400/api/products/1/comments -H "Content-Type: application/json" -d @- <<EOF
{
  "user": "trong",
  "body": "Shop ơi cho mình hỏi mình dùng iphone 6 lên con này tốn bao nhiêu vậy shop?"
}
EOF



```

Xem comments của product 1

```sh
curl localhost:40400/api/products/1/comments
```

```json
[
  {
    "user": "phuong",
    "body": "kết quả minigame công bố chưa QTV?",
    "productId": "1",
    "id": 1
  },
  {
    "user": "manh hung",
    "body": "Chào anh, Dạ thời gian công bố kết quả mini Game dự kiến sẽ trước 17h ngày 31/08/2020 ạ. Anh có thể vui lòng chờ thêm giúp em anh nhé. Xin thông tin đến anh !",
    "productId": "1",
    "id": 2
  },
  {
    "user": "duy",
    "body": "Giá chát quá",
    "productId": "1",
    "id": 3
  },
  {
    "user": "trong",
    "body": "Shop ơi cho mình hỏi mình dùng iphone 6 lên con này tốn bao nhiêu vậy shop?",
    "productId": "1",
    "id": 4
  }
]
```

#### Vá comment 3

```sh
curl -X PATCH localhost:40400/api/comments/3 -H "Content-Type: application/json" -d @- <<EOF
{
  "user": "duy",
  "body": "Giá quá chất",
  "rate": 5
}
EOF
```

Kiểm tra lại comment 3

```sh
curl localhost:40400/api/comments/3
```

#### Xóa comment 3

```sh
curl -X DELETE localhost:40400/api/comments/3
```

Xem lại tất cả comments sẽ không thấy comment 3

```sh
curl localhost:40400/api/comments
```
