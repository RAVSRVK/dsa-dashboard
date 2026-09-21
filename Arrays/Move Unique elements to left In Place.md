# Move Unique elements to left In Place

**Link:** https://leetcode.com/problems/remove-duplicates-from-sorted-array
**Difficulty:** Easy
**Date solved:** 2026-09-21
**Pattern:** Two Pointers

## Key idea

Brute force - Create a set and return the length


## Code

```javascript
var removeDuplicates = function(a) {
    let p = 0
    for(let i =0;i<a.length; i++) {
        if(a[p] < a[i]) {
            p+=1
            a[p] = a[i]
        }
    }
    return p+1
};

```

## Complexity

- **Time:** 
- **Space:** 

## Remember

[1,1,2,2,2,3,4] 
1st iteration - 1<1 - pass
2nd - 1 < 1 - pass
3rd iteration 1 < 2 - p value change and assign i value to p


## Revisit

- [ ] Redo without looking
