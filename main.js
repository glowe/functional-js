var
append,
assoc,
car,
cdr,
compose,
cons,
filter,
foldl,
foldr,
isList,
isNull,
isPair,
length,
list,
map,
not,
pairToString,
range,
yCombinator;

cons = function(a, b) {
    return function(f) {
        return f(a, b, "pair");
    };
};

isPair = function(pair) {
    return pair
        && typeof pair === "function"
        && pair(function(a, b, c) {
                    return c === "pair";
                });
};

car = function(pair) {
    return pair(function(a, b) {
                    return a;
                });
};

cdr = function(pair) {
    return pair(function(a, b) {
                    return b;
                });
};

isNull = function(a) {
    return a === null;
};

foldl = function(f, z, lst) {
    if (isNull(lst)) {
        return z;
    }
    return foldl(f, f(car(lst), z), cdr(lst));
};

foldr = function(f, z, lst) {
    if (isNull(lst)) {
        return z;
    }
    return f(car(lst), foldr(f, z, cdr(lst)));
};

filter = function(p, lst) {
    return foldr(function(a, b) {
                     if (p(a)) {
                         return cons(a, b);
                     }
                     return b;
                 },
                 null,
                 lst);
};

// Only works when g expects 1 argument and f expects up to 2 arguments :(
compose = function(f, g) {
    return function(a, b) {
        return f(g(a), b);
    };
};

map = function(f, lst) {
    if (not(isList(lst))) {
        throw "Argument to map is not a list: " + lst;
    }
    return foldr(compose(cons, f), null, lst);
};

not = function(a) {
    return !a;
};

list = function() {
    var a = Array.prototype.slice.apply(arguments);
    if (a.length === 0) {
        return null;
    }
    return cons(a[0], list.apply(this, a.slice(1)));
};

isList = function(a) {
    var helper = function(a) {
        if (isNull(a)) {
            return true;
        }
        else if (not(isPair(a))) {
            return false;
        }
        else {
            return helper(cdr(a));
        }
    };
    if (not(isPair(a))) {
        return false;
    }
    return helper(cdr(a));
};

length = function(lst) {
    if (not(isList(lst))) {
        throw "Argument to length is not a list: " + lst;
    }
    return foldl(function(x, accum) { return 1 + accum; }, 0, lst);
};

append = function(a, b) {
    return foldr(cons, b, a);
};

assoc = function(symbol, alist) {
    if (isNull(alist)) {
        return false;
    }
    if (car(car(alist)) === symbol) {
        return cdr(car(alist));
    }
    return assoc(symbol, cdr(alist));
};

pairToString = function(pair) {
    var s = [], helper;
    helper = function(pair) {
        if (isNull(pair)) {
            return;
        }

        s.push(car(pair));

        if (not(isNull(cdr(pair)))
            && not(isPair(cdr(pair)))) {
            s.push(cdr(pair));
            return;
        }

        helper(cdr(pair));
    };
    helper(pair);
    return "(" + s.join(" ") + ")";
};

range = function(start, end) {
    if (start === end) {
        return null;
    }
    return cons(start, range(start+1, end));
};

yCombinator = function (f) {
    return (function (x) {
                return f(function (a) {
                             return (x(x))(a);
                         });
            })(function (x) {
                   return f(function (a) {
                                return (x(x))(a);
                            });
               });
};

(function() {
     var fact = yCombinator(
         function(f) {
             return function(n) {
                 if (n === 0) {
                     return 1;
                 }
                 return n * f(n - 1);
             };
         });
     print(fact(6));
 })();

print("b = " + assoc("b", list(cons("a", 3), cons("b", 7), cons("c", 9))));

(function() {
     var even = function(a) { return a % 2 === 0; },
     square = function(a) { return a * 2; },
     sum = function(a, b) { return a + b; },
     odd = compose(not, even);

     print("square each even number in [1, 5] = "
           + pairToString(
               map(square,
                   filter(even, range(1, 6)))));

     print("sum of the squares of odd numbers in [0, 100] = "
           + foldl(sum, 0, map(square, filter(odd, range(0, 101)))));

 })();
