# sx5standings # wordstock - accessible at [https://sx5results.run/](https://sx5results.run/)

View the final general classification of the Acorn Trails South by Five race series after each race. 

The Acorn Trails South by Five series general classification website is a simple, responsive and accessible website that allows users to view the results of the Acorn Trails South by Five series. The website uses a simple design and color scheme, making it easy to navigate and understand.

The website uses a database with a table that contains race results. Each race has its own table, which makes it easy to modify the results if a runner drops out of the general classification. The results are calculated based on a system where 1st place gets 1 point, 2nd place gets 2 points and so on. The general classification is determined by identifying the person with the least number of points.

After the 3rd race, the points allocated for the 1st and 2nd race will change. If a runner misses 2 races, they will not be counted towards the final classification, and will be removed from the previous race results, changing the points allocated for each race and the general classification.

The website also has a table that contains runners' names, races array, that will in turn contain race1, race2, etc. For each race, the number of points is stored. Participation check is done after the 4th, 5th and 6th race, to see if a runner participated in the required number of races. At any point, the participation variable can be defined as nth race - 1. If the variable is less than nth - 1, then the runner needs to be removed from previous race results and the general classification needs to be regenerated.

Overall, the website provides a clear and concise way for users to view the results of the Acorn Trails South by Five series and stay updated on the current standings. The website's design and functionality make it easy for users to understand and navigate. The use of the database ensures that the results are accurate and up-to-date.
