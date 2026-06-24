export interface IAdmin {
    id: number;      
    title: string;   
    price: number;   
}

class IAdminClass implements IAdmin {
    constructor(public id: number, public title: string, public price: number) {}
}
export default IAdminClass;