import User from '../src/app/models/User';

function soma(a, b) {
	const r = process.env.NODE_ENV === 'test' ? '.env.test' : '.env'
	console.log(process.env.NODE_ENV.length);
	console.log(r);
	return a + b;
}

test('A soma de 4 e 5 deve retornar 7', () => {
	const result = soma(4, 5);
	expect(result).toBe(9);
})


test('teste get usuario', () => {
	const result = soma(4, 5);
	expect(result).toBe(9);
})
