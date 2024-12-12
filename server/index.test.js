import { expect } from "chai";
import fetch from 'node-fetch';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const SECRET_KEY = process.env.JWT_SECRET_KEY;

const base_url = 'http://localhost:3001';

let token;
let userId;
const validUser = { email: 'new@new.com', password: 'new1234' };

//successful tests

/*describe('POST register', () => {

    it ('should register with valid email and password', async() => {

        const response = await fetch(base_url + '/users/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json', 
            },
            body: JSON.stringify( validUser ),
        });

        const data = await response.json();

        expect(response.status).to.equal(201);
        expect(data).to.have.property('token');

        const decoded = jwt.verify(data.token, SECRET_KEY);
        expect(decoded).to.include.all.keys('id', 'email');
        expect(decoded.email).to.equal(validUser.email);

    });
});

describe('POST login', () => {

    it ('should login with valid credentials', async() => {
        const response = await fetch(base_url + '/users/login', {
            method: 'POST',
            headers: {
                'Content-Type':'application/json',
            },
            body: JSON.stringify( validUser ),
        });
        const data = await response.json();

        expect(response.status).to.equal(200);
        expect(data).to.have.property('token');

        token = data.token;
        const decoded = jwt.verify(token, SECRET_KEY);
        userId = decoded.id;
        console.log('Extracted userId:', userId);

        expect(decoded).to.include.all.keys('id', 'email');
        expect(decoded.email).to.equal(validUser.email);
    });
});

describe('GET a user', () => {

    it ('should get the user and email', async() => {
        const response = await fetch(base_url + '/users/me', {
            method: 'GET',
            headers: {
                'Content-Type':'application/json',
                'Authorization':`Bearer ${token}`,
            },
        });
        const data = await response.json();
        console.log('Response data:', data);
        expect(response.status).to.equal(200);
        expect(data[0]).to.have.property('id', userId);
        expect(data[0]).to.have.property('email');
    });
});

describe('DELETE user account', () => {
   
    it('should delete the user account with valid user id', async () => {
        const response = await fetch(base_url + '/users/delete', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization':`Bearer ${token}`,
            },
        });

        const data = await response.json();
        expect(response.status).to.equal(200);
        expect(data.message).to.equal('User account and related data deleted successfully');
    });
}); 

describe('POST logout', () => {
    it('should log the user out and empty the token', async () => {
        const response = await fetch(base_url + '/users/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        const data = await response.json();
        expect(response.status).to.equal(200);
        expect(data).to.have.property('message', 'Logged out successfully');
    });
});*/

describe('GET reviews', () => {
    it ('should get all reviews', async() => {
        const response = await fetch(base_url + '/review');
        const data = await response.json();

        expect(response.status).to.equal(200);
        expect(data).to.be.an('array').that.is.not.empty;
        expect(data[0]).to.include.all.keys('movie_id', 'user_email', 'stars', 'comment', 'timestamp', 'movie_title', 'movie_poster');
    });
});

//unAuthorized login options
describe('GET user information without logging in', () => {
    it('should not let anyone see users without logging in', async() => {
        const response = await fetch(base_url + '/users/me');
        const data = await response.json();
        console.log('output:', data);

        expect(response.status).to.equal(401);
        expect(data).to.have.property('message', 'No token provided');
    });
});

describe('POST invalid login user', () => {
    const invalidUser = { email: 'hihii@foo.com', password: 'hsdnd4' };
    it('should return invalid user message', async() => {
        const response = await fetch(base_url + '/users/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify( invalidUser ),
        });
        const data = await response.json();

        expect(response.status).to.equal(404);
        expect(data).to.have.property('message', 'User not found');
    });
});

describe('POST invalid login password', () => {
    const User = { email: 'foo@foo.com', password: 'fii123' };
    it('should return missing credentials message', async() => {
        const response = await fetch(base_url + '/users/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify( User ),
        });
        const data = await response.json();

        expect(response.status).to.equal(401);
        expect(data).to.have.property('message', 'Invalid credentials');
    });
});

describe('POST login with missing information', () => {
    const MissingEmail = { email: '', password: 'fii123' };
    it('should return missing message', async() => {
        const response = await fetch(base_url + '/users/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify( MissingEmail ),
        });
        const data = await response.json();

        expect(response.status).to.equal(400);
        expect(data).to.have.property('message', 'Email and password are required');
    });
});

//invalid registering options
describe('POST register with missing information', () => {
    const register = { email: 'hei@foo.com', password: '' };
    it('should return missing email or password message', async() => {
        const response = await fetch(base_url + '/users/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify( register ),
        });
        const data = await response.json();

        expect(response.status).to.equal(400);
        expect(data).to.have.property('message', 'Email and password are required');
    });
});

describe('POST register with invalid email', () => {
    const register = { email: 'foo@foo.com', password: 'helloWorld!' };
    it('should return error for email already in use', async() => {
        const response = await fetch(base_url + '/users/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(register),
        });
        const data = await response.json();

        expect(response.status).to.equal(409);
        expect(data).to.have.property('message', 'Email already in use');
    });
});

//tests from first base testing without any front here
/*
describe('GET Movies', () => {
    it ('should get all movies', async() => {
        const response = await fetch(base_url + '/api/movies');
        const data = await response.json();

        expect(response.status).to.equal(200);
        expect(data).to.be.an('array').that.is.not.empty;
        expect(data[0]).to.include.all.keys('id', 'title', 'release_year', 'poster_path');
    });
});
describe('GET Movies by id', () => {
    it ('should get a movie by a valid id', async() => {
        const response = await fetch(base_url + '/api/movies/movie/1034541');
        const data = await response.json();

        console.log('Response data:', data);

        expect(data).to.be.an('object');
        expect(data).to.include.all.keys('id','title','release_year','poster_path');
        expect(data.id).to.equal(1034541);
    });
});
describe('GET showtimes', () => {
    it('should return showtimes from database', async() => {
        const response = await fetch(base_url + '/showtimes/shows');
        const data = await response.json();
        expect(response.status).to.equal(200);
        expect(data).to.be.an('array').that.is.not.empty;
        expect(data[0]).to.include.all.keys('id', 'movie_title', 'theatre_name', 'show_time', 'picture');
    })
});
describe('POST customization', () => {
    it('should allow a groupmember to post to group', async () => {
        const userId = 10;
        const groupId = 1;
        const response = await fetch(base_url + '/custom', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId,
            },
            body: JSON.stringify({
                group_id: groupId,
                movie_id: 519182,
            }),
        });

        const data = await response.json();
        expect(response.status).to.equal(201);
        expect(data.message).to.equal('Movie or showtime added');
    });
});
describe('POST review', () => {
    it('should post a review', async () => {
        const userId = 10;
        const response = await fetch(base_url + '/review', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId,
            },
            body: JSON.stringify({
                movie_id: 519182,   // The movie ID you're reviewing
                stars: 5, 
                comment: "Great movie!",
            }),
        });

        const data = await response.json();
        expect(response.status).to.equal(201);
        expect(data.message).to.equal('Review added successfully');
    });
});
describe('GET favorites for user', () => {
    it('should get favorites for logged in user', async () => {
        const userId = 10;
        const response = await fetch(base_url + '/favorites', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId,
            },
        }); 
        const data = await response.json();

        expect(response.status).to.equal(200);
        expect(data).to.be.an('array');

                if (data.length > 0) {
            expect(data[0]).to.have.property('movie_id');
        }
    });
});
describe('POST new favorites', () => {
    it('should add new favorite movies to the list', async () => {
        const userId = 10;
        const movie_id = 558449;
        const response = await fetch(base_url + '/favorites', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId,
            },
            body: JSON.stringify({ movie_id }),
        });
        const data = await response.json();

        expect(response.status).to.equal(201);
        expect(data.message).to.equal('Movie added to favorites');
        expect(data.fav).to.have.property('movie_id', movie_id);
    });
});
describe('DELETE movies from list', () => {
    it('should delete movies from favorite list', async () => {
        const userId = 10;
        const movie_id = 558449;
        const response = await fetch(base_url + `/favorites/${movie_id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId,
            },
        });
        const data = await response.json();

        expect(response.status).to.equal(200);
        expect(data.message).to.equal('Movie removed from favorites');
    });
});
describe('GET public favorites list', () => {
    it('should retrieve public favorites list via URI', async () => {
        const share_uri = '75afa09c5b9e64971b96219ecca07a11';
        const response = await fetch(base_url + `/favorites/public/${share_uri}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();
        expect(response.status).to.equal(200);
        expect(data).to.be.an('array');
        if (data.length > 0) {
            expect(data[0]).to.have.property('movie_id');
        }
    });
});
describe('DELETE /groups/:groupId', () => {
    it('should delete the group if the user is the creator', async () => {
        const groupId = 6; 
    
        const response = await fetch(base_url + `/groups/${groupId}`, {
            method: 'DELETE',
            headers: {
                'user-id': 2, // Valid userId (creator)
            },
        });

        const data = await response.json();
        expect(response.status).to.equal(200);
        expect(data.message).to.equal('Group deleted');
    });

    it('should return an error if the user is not the creator', async () => {
        const groupId = 1; 
        const userId = 2;
        const response = await fetch(base_url + `/groups/${groupId}`, {
            method: 'DELETE',
            headers: {
                'user-id': userId, // Non-creator userId
            },
        });

        const data = await response.json();
        expect(response.status).to.equal(403);
        expect(data.message).to.equal('Only the creator can delete a group');
    });
});
describe('GET /groups', () => {
    it('should fetch all groups', async () => {
        const response = await fetch(base_url + '/groups', {
            method: 'GET',
            headers: {
                'user-id': userId,
            },
        });

        const data = await response.json();
        expect(response.status).to.equal(200);
        expect(data).to.be.an('array');

        expect(data[0]).to.have.property('id');
        expect(data[0]).to.have.property('name');
        expect(data[0]).to.have.property('status').that.is.oneOf(['creator', 'member', 'requested', 'not_member']);
    });
});

/*describe('POST /groups/create', () => {
    it('should create a new group', async () => {
        const userId = 2;
        const groupData = {
            name: 'delete me',
        };

        const response = await fetch(base_url + '/groups/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json', 
                'user-id': userId,
            },
            body: JSON.stringify(groupData),
        });

        const data = await response.json();
        expect(response.status).to.equal(201);
        expect(data.message).to.equal('Group created');
        expect(data.group).to.have.property('id');
        expect(data.group).to.have.property('name', groupData.name);
        expect(data.group).to.have.property('creator_id', userId);
    });
});

describe('POST request for group', () => {
    it('should send a join request to the group', async () => {
        const groupId = 6;
        const userId = 10;
        const response = await fetch(base_url + `/groups/${groupId}/request`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId,
            },
        });
        const data = await response.json();
        expect(response.status).to.equal(201);
        expect(data.message).to.equal('Request sent to join the group');
    });

    it('should return error if request exists', async () => {
        const groupId = 6;
        const response = await fetch(base_url + `/groups/${groupId}/request`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId, 
            },
        });

        const data = await response.json();
        expect(response.status).to.equal(400);
        expect(data.message).to.equal('You have requested to join already');
    });
});

describe('POST answer to request', () => {
    it('should accept a request', async () => {
        const groupId = 6;
        const requester = 10;
        const userId = 2;
        const response = await fetch(base_url + `/groups/${groupId}/answer/${requester}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId,
            },
            body: JSON.stringify({ action: 'accept' }),
        });

        const data = await response.json();
        expect(response.status).to.equal(200);
        expect(data.message).to.equal('User added to group');
    });

    it('should decline a users request', async () => {
        const groupId = 6;
        const requester = 4;
        const userId = 2;
        const response = await fetch(base_url + `/groups/${groupId}/answer/${requester}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId,
            },
            body: JSON.stringify({ action: 'decline' }),
        });

        const data = await response.json();
        expect(response.status).to.equal(200);
        expect(data.message).to.equal('Request declined');
    });
    
    it('should return error if action is invalid', async () => {
        const groupId = 1; 
        const userId = 10; 
        const response = await fetch(base_url + `/groups/${groupId}/answer/${userId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId, 
            },
            body: JSON.stringify({ action: 'invalidAction' }),
        });

        const data = await response.json();
        expect(response.status).to.equal(400);
        expect(data.message).to.equal('Action must be "accept" or "decline"');
    });

    it('should return an error if not the creator', async () => {
        const groupId = 6;
        const userId = 4;
        const response = await fetch(base_url + `/groups/${groupId}/answer/${userId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId, 
            },
            body: JSON.stringify({ action: 'accept' }),
        });
        
        const data = await response.json();
        expect(response.status).to.equal(403);
        expect(data.message).to.equal('Only the creator can accept or decline');
    });
});

describe('GET group page', () => {
    it('should fetch group details if user is in the group', async () => {
        const groupId = 1;
        const response = await fetch(base_url + `/groups/${groupId}`, {
            method: 'GET',
            headers: {
                'user-id': userId,
            },
        });

        const data = await response.json();
        expect(response.status).to.equal(200);
        expect(data).to.have.property('id');
        expect(data).to.have.property('name');
    });

    it('should return error if user is not in the group', async () => {
        const groupId = 1;
        const userId = 2;
        const response = await fetch(base_url + `/groups/${groupId}`, {
            method: 'GET',
            headers: {
                'user-id': userId,
            },
        });

        const data = await response.json();
        expect(response.status).to.equal(403);
        expect(data.message).to.equal('You are not a member');
    });
});*/
