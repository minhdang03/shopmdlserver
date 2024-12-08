# Sử dụng Node.js phiên bản LTS
FROM node:18-alpine

# Tạo thư mục làm việc
WORKDIR /usr/src/app

# Copy package.json và package-lock.json
COPY package*.json ./

# Cài đặt dependencies
RUN npm install

# Copy source code
COPY . .

# Expose cổng 3002
EXPOSE 3002

# Khởi động ứng dụng
CMD ["npm", "start"]