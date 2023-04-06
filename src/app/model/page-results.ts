export class PageResults {
    public xTotalCount: number;
    private _pageNumber:number=0;
    public offset:number=0;
    public limit:number=5;

    //private hasMorePages:boolean;

    public get hasMorePages(){
      if (this.xTotalCount>this.offset*this.pageNumber){
        return true;
      }
      return false;
    }
    public get totalPages(){
      return Math.ceil(this.xTotalCount/this.limit);
    }
    public get nextPage(){
      this._pageNumber++;
      this.offset = this.offset+this.limit;
      return this.offset;
    }
    public get pageNumber(){
      return this._pageNumber +1;
    }
}
