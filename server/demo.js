import axios from 'axios';

const options = {method: 'GET', url: 'http://127.0.0.1:2022/api/channels/interactioned/list'};

try {
    const { data } = await axios.request(options);
    console.log(data);
} catch (error) {
    console.error(error);
}