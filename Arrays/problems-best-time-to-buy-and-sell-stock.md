# Problems/Best Time To Buy And Sell Stock

**Slug:** problems/best-time-to-buy-and-sell-stock
**Link:** https://leetcode.com/problems/problems/best-time-to-buy-and-sell-stock
**Difficulty:** Easy
**Date solved:** 2026-09-22
**Pattern:** Two pointers

## Problem in my own words

You are given an array prices where prices[i] is the price of a given stock on the ith day.

You want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock.

Return the maximum profit you can achieve from this transaction. If you cannot achieve any profit, return 0.



## Examples

### Example 1

- **Input:** prices = [7,1,5,3,6,4]

- **Output:** 5
- **Explanation:** Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6-1 = 5.
Note that buying on day 2 and selling on day 1 is not allowed because you must buy before you sell.


### Example 2

- **Input:** prices = [7,6,4,3,1]

- **Output:** 0
- **Explanation:** In this case, no transactions are done and the max profit = 0.
 

## Key idea

brute force approach - 
I and J loops check for each possible approach but time complexity is O(n^2)

Better solution - 
take 2 vars 
maxProfit and minVal  = a[0] 
Iterate through the loop and update the minVal and calculate possible maxProfit
TIme complexity O(n)

## Code

```javascript
var maxProfit = function(prices) {
    let minVal = prices[0] 
    let maxProfit = 0
    for(let i =0; i< prices.length; i++) {
        if(prices[i] < minVal ) {
            minVal = prices[i]
        }
        if(prices[i] - minVal > maxProfit) {
            maxProfit = prices[i] - minVal
        }
    }
    return maxProfit
}
```

## Dry run

### Example 1

**Input:** prices = [7,1,5,3,6,4]

| Iteration | Variables state | Observation | Notes or changes |
| --- | --- | --- | --- |
| 1 | minVal = 7<br>maxProfit = 0<br>i=7 |  |  |
| 2 | minVal = 7<br>maxProfit = 0<br>i=1 | minVal = 1<br>maxProfit = 0 |  |
| 3 | minVal = 1<br>maxProfit = 0<br>i=5 | minVal = 1<br>maxProfit = 4 |  |
| 4 | minVal = 1<br>maxProfit = 4<br>i=3 | minVal = 1<br>maxProfit = 4 |  |
| 5 | minVal = 1<br>maxProfit = 4<br>i=6 | minVal = 1<br>maxProfit = 5 |  |

## Complexity

- **Time:** O(n)
- **Space:** 

## Remember



## Revisit

- [ ] Redo without looking
