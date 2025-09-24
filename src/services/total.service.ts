import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';

@Injectable()
export class TotalService {

	public total: number = 0;

	constructor(public storage: Storage) {}

	resetTotal(): void {
		this.storage.set('grocery_list_total', '0');
	}

	setTotal(data): void {
		this.storage.set('grocery_list_total', data);
	}

	getTotal(): number {
    	this.storage.get('grocery_list_total')
			.then((totalString: string) => {
				if (totalString) this.total = JSON.parse(totalString);
			})
      	return this.total;
  	}
}