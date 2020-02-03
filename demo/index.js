import {Client, decorators} from 'RestClient';

const {use, retry, timeout} = decorators;

@use('request', (req, next) => {
    console.info('This is a request Plugin!');
    next();
})
class Test extends Client {
    @retry()
    @timeout()
    getTodos() {
        return this.get('https://jsonplaceholder.typicode.com/todos', {userId: 10});
    }
};

const client = new Test();
const table = document.getElementById('table');
client.getTodos().then(data => {
    const tmp = [
        'GET',
        'https://jsonplaceholder.typicode.com/todos',
        JSON.stringify({userId: 10}),
        '-',
        JSON.stringify(data)
    ];
    const newRow = table.insertRow(-1);
    newRow.innerHTML = '<td>' + tmp.join('</td><td>') + '</td>';
});