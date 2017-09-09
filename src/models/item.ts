export class Item {
	public name: string;
	public price: number = 0.0;
	public pricePerUnit = 0.0;
	public quantity: number = 0;
	public quantityToRemove: number = 1;
	public weight: number = 0.0;
	public inCart: boolean = false;
	public ifRemove: boolean = false;
}