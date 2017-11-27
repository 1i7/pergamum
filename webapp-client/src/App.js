import React from 'react';

import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';


import {
  BrowserRouter as Router,
  Route,
  Link,
  Switch,
  Redirect
} from 'react-router-dom'

import keycode from 'keycode';

import {ScaleLoader} from 'halogenium';
import CircularProgress from 'material-ui/CircularProgress';

const btnStyle = {
  margin: 12
};

// no standard, so HttpRequest is ok
// https://daveceddia.com/ajax-requests-in-react/
var readServerString = function(url, callback) {
    var req = new XMLHttpRequest();
    req.onreadystatechange = function() {
        if (req.readyState === 4) { // only if req is "loaded"
            if (req.status === 200) { // only if "OK"
                callback(undefined, req.responseText);
            } else {
                // error
                callback(new Error(req.status + ": " + req.responseText));
            }
        }
    };
    // can't use GET method here as it would quickly 
    // exceede max length limitation
    req.open("POST", url, true);

    //Send the proper header information along with the request
    req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    req.send();
}

class BookItem extends React.Component {
    render() {
        return (
            <div style={{marginTop: 10}}>[{this.props.item.index}]
                <span style={{fontWeight: 'bold'}}> {this.props.item.leader}</span><br/>
                {this.props.item.author ? (<span><span> автор: {this.props.item.author}</span><br/></span>) : ""}
                {this.props.item.bookName ? (<span> название: {this.props.item.bookName}</span>) : ""}
            </div>
        );
    }
}

class SearchInput extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            newSearch: (this.props.search ? this.props.search : ''),
            redirectToSearch: false
        };
    }
    
    componentWillReceiveProps(nextProps) {
        this.setState({newSearch: (nextProps.search ? nextProps.search : '')});
    }
    
    gotoSearch() {
        // redirect to perform actual search
        this.setState({
            redirectToSearch: true
        });
    }
    
    handleSearchChange = (event) => {
        this.setState({
            newSearch: event.target.value,
        });
    }
    
    handleSearchKeyDown = (event) => {
        // https://github.com/callemall/material-ui/blob/v0.15.4/src/TextField/TextField.js#L367
        //console.log(event.keyCode);
        //if(event.keyCode === 13) {
        if(this.state.newSearch.length > 0 && keycode(event) === 'enter') {
            this.gotoSearch();
        }
    }
    
    clickSearch = () => {
        this.gotoSearch();
    }
    
    render() {
        if(this.state.redirectToSearch) {
            this.setState({redirectToSearch: false});
            return <Redirect push={true} to={"/s/" + this.state.newSearch}/>;
        }
        
        return (
            <span style={this.props.style}>
                <TextField
                    hintText="author, book name etc"
                    value={this.state.newSearch}
                    onChange={this.handleSearchChange}
                    onKeyDown={this.handleSearchKeyDown}
                    style={{width: 600}} />
                <RaisedButton 
                    label="искать"
                    onClick={this.clickSearch}
                    disabled={this.state.newSearch.length === 0}
                    style={btnStyle}
                    primary={true}/>
            </span>
        );
    }
}

class SearchNav1 extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            newPage: 1,
            redirectToPage: false
        };
    }
    
    gotoPage(page) {
        // redirect to page for current search
        this.setState({
            redirectToPage: true,
            newPage: page
        });
    }
    
    render() {
        if(this.state.redirectToPage) {
            this.setState({redirectToPage: false});
            return <Redirect push={true} to={"/s/" + this.props.search + (this.state.newPage ? "/" + this.state.newPage : "")}/>;
        }
        
        // панель навигации по страницам
        //var navPane = [];
        // в таком виде не сработает, клик все время будет переводить на последнюю страницу
        //for(var i = 1; i <= this.props.pageNum; i++) {
        //    navPane.push(<span style={{cursor: 'pointer'}} onClick={()=>{this.gotoPage(i)}}> {i}</span>)
        //}
        
        // нужно использовать array.map, который сохраняет контекст для индекса
        // https://stackoverflow.com/questions/29149169/how-to-loop-and-render-elements-in-react-js-without-an-array-of-objects-to-map
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
        var pageNumbers = [];
        for(var i = 1; i <= this.props.pageNum; i++) {
            pageNumbers.push(i);
        }
        var navPane = pageNumbers.map(function(pageNumber, i) {
            //return <span style={{cursor: 'pointer'}} onClick={()=>{this.gotoPage(pageNumber)}}> {pageNumber}</span>;
            return <Link to={"/s/" + this.props.search + "/" + pageNumber}> {pageNumber}</Link>;
        }.bind(this));
  
        return (
            <div id="pages" style={{fontStyle: 'italic'}}>{navPane}</div>
        );
    }
}

class SearchNav extends React.Component {
    render() {
        var gotoPageStyle = {marginRight: 15, fontSize: '18pt', color: 'black', textDecoration: 'none', ...this.props.gotoPageStyle};
        var currPageStyle = {fontWeight: 'bold', color: 'red', ...this.props.currPageStyle};
        
        var currPage = parseInt(this.props.page, 10);
        
        // сгенерируем список страниц
        var pages = [];
        
        if(this.props.maxPages && this.props.pageNum > this.props.maxPages) {
            // значение maxPages не менее 5
            var maxPages = this.props.maxPages >= 5 ? this.props.maxPages : 5;
            
            if(currPage < maxPages - 1) {
                // текущая страница слева
                
                for(let i = 1; i < maxPages; i++) {
                    pages.push(i);
                }
                
                // перерыв (многоточие)
                pages.push(0);
                
                pages.push(this.props.pageNum);
                
            } else if(currPage > this.props.pageNum - maxPages + 2) {
                // текущая страница справа
                
                pages.push(1);
                
                // перерыв (многоточие)
                pages.push(0);
                
                for(let i = this.props.pageNum - maxPages + 2; i <= this.props.pageNum; i++) {
                    pages.push(i);
                }
            } else {
                // текущая страница по центру
                
                // добавить в список 1ю и последнюю страницы,
                // тек страница-n/2, тек страница+n/2
                pages.push(1);
                
                // перерыв (многоточие)
                pages.push(0);
                
                // текущая страница и несколько вокруг
                for(let i = currPage - (maxPages-2)/2; i < currPage + (maxPages-2)/2; i++) {
                    pages.push(i);
                }
                
                // перерыв (многоточие)
                pages.push(0);
                
                pages.push(this.props.pageNum);
            }
        } else {
            // все подряд
            for(let i = 1; i <= this.props.pageNum; i++) {
                pages.push(i);
            }
        }
        
        // панель навигации по страницам
        var navPane = [];
        for(let i = 0; i < pages.length; i++) {
            var page = pages[i];
            if(page === 0) {
                navPane.push(<span
                    style={{...gotoPageStyle}}>...</span>);
            } else if(page === currPage) {
                navPane.push(<span
                    style={{...gotoPageStyle, ...currPageStyle}}>{page}</span>);
            } else {
                navPane.push(<Link to={"/s/" + this.props.search + "/" + page}
                    style={gotoPageStyle}>{page}</Link>);
            }
        }
        
        return (
            <div style={{marginTop: 10, ...this.props.style}}>{navPane}</div>
        );
    }
}

class SearchMain extends React.Component {
    render() {
        return (
            <div style={{textAlign: 'center', margin: 30}}>
                <SearchInput/>
            </div>
        );
    }
}

class SearchWidget extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            search: this.props.match.params.search ? this.props.match.params.search : '',
            page: this.props.match.params.page ? this.props.match.params.page : 1,
            resultCount: 0,
            resultPageSize: 10,
            resultItems: [],
            in_progress: false,
            err: undefined
        };
    }
    
    makeSearch(search, page) {
        this.setState({in_progress: true});
        
        // make actual search on server
        readServerString("/api/search/" + search + (page ? "/" + page : ""),
                function(err, res) {
            if(err) {
                this.setState({in_progress: false, err: err});
                console.log(err);
            } else {
                var sresult = JSON.parse(res);
                if(sresult.err) {
                    this.setState({in_progress: false, err: sresult.err});
                } else {
                    this.setState({
                        in_progress: false, 
                        //page: sresult.page,
                        resultCount: sresult.count,
                        resultPageSize: sresult.pageSize,
                        resultItems: sresult.items,
                        err: undefined
                    });
                }
            }
        }.bind(this));
    }
    
    componentDidMount() {
        this.makeSearch(this.props.match.params.search, this.props.match.params.page);
    }
    
    componentWillReceiveProps(nextProps) {
        this.setState({
            search: nextProps.match.params.search ? nextProps.match.params.search : '',
            page: nextProps.match.params.page ? nextProps.match.params.page : 1
        });
        this.makeSearch(nextProps.match.params.search, nextProps.match.params.page);
    }
    
    render() {
        // результаты поиска
        var bookItems = [];
        for (var i = 0; i < this.state.resultItems.length; i++) {
            bookItems.push((<BookItem item={this.state.resultItems[i]}/>));
        }
  
        return (
            <div style={{marginLeft: 90, marginTop: 20, width: 800}}>
                {this.state.in_progress ?
                    /*<CircularProgress size={30} style={{position: "fixed", left: 50, top: 80}} /> */
                    <ScaleLoader color="black" size="10px" style={{position: "fixed", left: 40, top: 70}}/>: ""
                }
                
                <div style={{position: "fixed", left: 90, top: 0, width:'100%', background: 'white'}}>
                    <SearchInput search={this.state.search} />
                </div>
                
                {!this.state.err ?
                    <div style={{marginBottom: 90, marginTop: 70}}>
                        <div style={{fontSize: '12pt'}}>по запросу: <span id="search_str">{this.state.search}</span></div>
                        <div style={{fontSize: '12pt', fontWeight: 'bold'}}>нашлось: <span id="count">{this.state.resultCount}</span></div>
                        <div style={{fontStyle: 'italic'}}>{bookItems}</div>
                    </div> :
                    <div style={{marginBottom: 90, marginTop: 70}}>ошибка: {this.state.err}</div>
                }
                
                <SearchNav search={this.state.search} page={this.state.page} pageNum={Math.ceil(this.state.resultCount/this.state.resultPageSize)}
                    maxPages={10}
                    style={{background: 'white',
                        position: "fixed", bottom: 0, paddingTop: 10,
                        paddingBottom: 30, width: "100%", textAlign: 'left'}}/>
            </div>
        );
    }
}

class App extends React.Component {
    render() {
        return (
            <Router>
                <div>
                    <Switch>
                        <Route exact path="/" component={SearchMain}/>
                        <Route path="/s/:search/:page" component={SearchWidget} />
                        <Route path="/s/:search" component={SearchWidget}/>
                        <Route path="/s/" component={SearchWidget}/>
                        <Route path="/s" component={SearchWidget}/>
                    </Switch>
                </div>
            </Router>
        );
    }
}

export default App;

