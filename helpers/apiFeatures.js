class APIFeatures {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }

    // Our Class Methods
    filter() {
        const queryObj = {...this.queryString}; // to get an obj with all query params
        // so we can exclude whatever params (that don't present in our document)
        // we want like page, sort and so on
        const excludedFields = ['page', 'sort', 'limit', 'fields'];
        // now let's delete those fields from our object
        excludedFields.forEach(el => delete queryObj[el]);


        //
        let queryString = JSON.stringify(queryObj);
        // do some regex
        queryString = queryString.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`); // to add $
        // Let's convert our string to object again
        this.query = this.query.find(JSON.parse(queryString));
        return this;
    }

    sort() {
        if(this.queryString.sort) {
            const sortBy = this.queryString.sort.split(',').join(' ');
            this.query = this.query.sort(sortBy);
            
        } else {
            this.query = this.query.sort('-createdAt');
        }
        return this;
    }

    limitFields() {
        if(this.queryString.fields) {
            const fields = this.queryString.fields.split(',').join(' ');
            this.query = this.query.select(fields);
        }else {
            this.query = this.query.select('-__v');
        }
        return this;
    }

    paginate() {
        if(this.queryString.page || this.queryString.limit) {
            const page = +this.queryString.page || 1;
            const limit = +this.queryString.limit || 2; // 2 docs for every page
            const skip = (page -1) * limit;
            this.query = this.query.skip(skip).limit(limit);
        }
        return this;
    }
}
// Let's do some user optional data (query strings)
// Let's build query
// const queryObj = {...req.query}; // to get an obj with all query params
// // so we can exclude whatever params (that don't present in our document)
// // we want like page, sort and so on
// const excludedFields = ['page', 'sort', 'limit', 'fields'];
// // now let's delete those fields from our object
// excludedFields.forEach(el => delete queryObj[el]);


// //
// let queryString = JSON.stringify(queryObj);
// // do some regex
// queryString = queryString.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`); // to add $
// // Let's convert our string to object again
// const lastQueryObj = JSON.parse(queryString);
//

// we didn't execute the query right now, because, we may need in the future
// to chain more methods before fetching the data like sorting and so on.
// let query = Tour.find(lastQueryObj);

// (2) if we want to sort the data
// if(req.query.sort) {
//     const sortBy = req.query.sort.split(',').join(' ');
//     query = query.sort(sortBy);
    
// } else {
//     query = query.sort('-createdAt');
// }

// (3) what if we want to limit the returned data ?
// '?fields=name,price,summary,-duration'
// if(req.query.fields) {
//     const fields = req.query.fields.split(',').join(' ');
//     query = query.select(fields);
// }else {
//     query = query.select('-__v');
// }

// (4) Pagination

// '?page=2&limit=2' => means 2 docs for every page
// if(req.query.page || req.query.limit) {
//     const page = +req.query.page || 1;
//     const limit = +req.query.limit || 2; // 2 docs for every page
//     const skip = (page -1) * limit;
//     const numTours = await Tour.countDocuments();
//     // if we don't have more docs
//     // if we want to pass an error to the catch block, we just need to throw it
//     if(skip >= numTours) throw new Error("This page doesn't exist");

//     // skip(), means skip 2 docs for every page
//     // page=1 => 1-2, page=2 => 3-4 and so on
//     query = query.skip(skip).limit(limit);
// }

// what if we want to make the url with all these query strings short?
// we could make an alias and and make  a route for it, then we pre-define the query strings
// on our own (not the user) in a middleware, look at the upper middleware

module.exports = APIFeatures;