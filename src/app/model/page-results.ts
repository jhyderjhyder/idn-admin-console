export class PageResults {
  public xTotalCount: number;
  private _currentPage: number = 0;
  public offset: number = 0;
  public limit: number = 5;

  //private hasMorePages:boolean;

  public get hasMorePages() {
    if (this.xTotalCount > this.offset * this._currentPage) {
      return true;
    }
    return false;
  }
  public get totalPages() {
    return Math.ceil(this.xTotalCount / this.limit);
  }

  public paggination(){
    const array:number[] = Array(1);
    var i = 2;
    while (this.totalPages>=i){
      array.push(i);
      i++;
    }
   
    return array;
  }

  public getPageByNumber(input){
    this._currentPage= input;
    this.offset = input * this.limit;
  }

  public get nextPage() {
    if (this._currentPage<=this.totalPages)
    this._currentPage++;
    this.offset = this.offset + this.limit;
    return this.offset;
  }
  public get prevPage() {
    if (this.currentPage>0){
    this._currentPage--;
    this.offset = this._currentPage * this.limit;
    }
    return this.offset;
  }
  public get currentPage() {
    return this._currentPage + 1;
  }
  

}
