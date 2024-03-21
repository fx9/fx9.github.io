
import unittest

# https://leetcode.ca/all/751.html  https://aaronice.gitbook.io/lintcode/bit-operation/ip-to-cidr

def ip_to_cidr(ip, n):
    results = []
    # ip to int
    ip_int = ip_to_int(ip)
    ip_int_to_cidr_internal(ip_int, n, results)
    return results


def ip_to_int(ip):
    ip_strs = ip.split(".")
    return (int(ip_strs[0]) << 24) + (int(ip_strs[1]) << 16) + (int(ip_strs[2]) << 8) + int(ip_strs[3])


def int_to_ip(ip_int):
    mask = (1 << 8) - 1

    sections = ["", "", "", ""]

    for i in range(4):
        ip_int = ip_int >> (8 * i)
        sections[3 - i] = str(mask & ip_int)

    return ".".join(sections)


def ip_int_to_cidr_internal(ip_int, n, results):
    if n == 0:
        return

    if ip_int == 0:
        ip_int_to_cidr_add_from_n(ip_int, n, results)
        return

    for i in range(32):
        mask = 1 << i
        if mask & ip_int != 0:
            if mask > n:
                ip_int_to_cidr_add_from_n(ip_int, n, results)
            else:
                # add a section of mask
                results.append(int_to_ip(ip_int) + "/" + str(32 - i))
                ip_int_to_cidr_internal(ip_int + mask, n - mask, results)
            return


def ip_int_to_cidr_add_from_n(ip_int, n, results):
    j = 0
    mask = n
    while mask > 1:
        j += 1
        mask = mask >> 1
    mask = 1 << j
    results.append(int_to_ip(ip_int) + "/" + str(32 - j))
    ip_int_to_cidr_internal(ip_int + mask, n - mask, results)


def test1():
    print(ip_to_cidr("255.0.0.7", 10))
    print(ip_to_cidr("0.0.0.0", 10))
    print(ip_to_cidr("255.0.0.7", 1024))
    print(ip_to_cidr("0.0.0.0", 1024))
    print(ip_to_cidr("0.0.0.0", 1 << 32))


# https://leetcode.com/discuss/interview-question/4007625/Databricks-OA-or-Software-Engineer-L4
def cidr_match(rules, ip):
    for rule in rules:
        result = cidr_match_rule(rule, ip)
        if result == 1:
            return True
        if result == -1:
            return False
    return False


def cidr_match_rule(rule, ip):
    if 'ALLOW' in rule:
        if cidr_match_ip(rule['ALLOW'], ip):
            return 1
        else:
            return 0

    if 'DENY' in rule:
        if cidr_match_ip(rule['DENY'], ip):
            return -1
        else:
            return 0


def cidr_match_ip(cidr, ip):
    cidr_split = cidr.split('/')
    if len(cidr_split) == 1:
        return cidr == ip

    mask_len = int(cidr_split[1])
    if mask_len == 0:
        return True

    cidr_ip_int = ip_to_int(cidr_split[0])
    ip_int = ip_to_int(ip)
    mask = ((1 << mask_len) - 1) << (32 - mask_len)

    return cidr_ip_int & mask == ip_int & mask


def test1_1():
    rules = [
        {"ALLOW": "192.168.100.0/24"},
        {"ALLOW": "192.168.0.5/30"},
        {"DENY": "8.8.8.8/0"},
        {"ALLOW": "1.2.3.4"},
    ]
    print(cidr_match(rules, "192.168.100.123"))
    print(cidr_match(rules, "1.2.3.4"))


# https://leetcode.ca/all/362.html
import time


class HitCounter:

    def __init__(self, time_func=time.time):
        self.buckets = [(i, 0) for i in range(300)]
        self.time_func = time_func

    def hit(self):
        ts = int(self.time_func())
        bucket_index = ts % 300
        bucket_ts, count = self.buckets[bucket_index]
        if ts == bucket_ts:
            self.buckets[bucket_index] = (ts, count + 1)
        else:
            self.buckets[bucket_index] = (ts, 1)

    def count(self):
        ts = int(self.time_func())
        total = 0
        for bucket_ts, count in self.buckets:
            if ts - bucket_ts <= 300:
                total += count
        return total


mock_timer_t = 0


def mock_timer():
    global mock_timer_t
    return mock_timer_t


def test2():
    global mock_timer_t
    hc = HitCounter(mock_timer)
    for i in range(10):
        mock_timer_t = i
        hc.hit()
        hc.hit()
    print(hc.count())
    print(hc.buckets)
    mock_timer_t = 600
    print(hc.count())
    print(hc.buckets)

    for i in range(5):
        mock_timer_t = 600 + i
        hc.hit()
        hc.hit()
    print(hc.count())
    print(hc.buckets)


# https://www.1point3acres.com/bbs/interview/databricks-software-engineer-775327.html

# BST map like c++ std::map or Java TreeMap
# sortedContainer.SortedList
import sortedcontainers


class MySortedDict:
    def __getitem__(self, key):
        pass

    def __setitem__(self, key):
        pass

    def __delitem__(self, key):
        pass

    def __len__(self):
        pass


class Customer:

    def __repr__(self):
        return str(self.revenue)

    def __init__(self, id, parent, revenue):
        self.id = id
        self.parent = parent
        self.children = []
        self.revenue = revenue


class CustomerRevenue:

    def __init__(self):
        self.customers = []
        self.revenues = sortedcontainers.SortedList()

    def insert(self, revenue):
        new_id = len(self.customers)
        self.customers.append(Customer(new_id, -1, revenue))
        self.revenues.add(revenue)

    def insert_with_ref(self, revenue, referrer_id):
        new_id = len(self.customers)
        self.customers.append(Customer(new_id, referrer_id, revenue))
        self.customers[referrer_id].children.append(new_id)
        self.revenues.add(revenue)
        while referrer_id != -1:
            self.revenues.remove(self.customers[referrer_id].revenue)
            self.customers[referrer_id].revenue += revenue
            self.revenues.add(self.customers[referrer_id].revenue)
            referrer_id = self.customers[referrer_id].parent

    def get_k_lowest_revenue(self, k, target_revenue):
        result = []
        for r in self.revenues.irange(target_revenue, None, (False, True)):
            result.append(r)
            if len(result) >= k:
                return result
        return result


def test3():
    cr = CustomerRevenue()
    cr.insert(10)
    cr.insert(20)
    cr.insert_with_ref(30, 1)
    cr.insert_with_ref(30, 2)
    cr.insert(20)
    print(cr.customers)
    print(cr.revenues)
    print(cr.get_k_lowest_revenue(2, 20))


# https://www.1point3acres.com/bbs/thread-1023221-1-1.html

class SnapshotSet:
    ADD = 1
    REMOVE = 0

    def __init__(self):
        self.set = {}
        self.transactions = {}
        self.iter = None

    def add(self, e):
        if self.iter:
            self.transactions[e] = self.ADD
        else:
            self.set[e] = 1

    def remove(self, e):
        if self.iter:
            self.transactions[e] = self.REMOVE
        else:
            if e in self.set:
                del self.set[e]

    def __contains__(self, item):
        if item in self.transactions:
            return self.transactions[item] == self.ADD
        return item in self.set

    def __iter__(self):
        self.iter = self.set.__iter__()
        return self

    def __next__(self):
        try:
            return self.iter.__next__()
        except StopIteration:
            for key in self.transactions:
                if self.transactions[key] == self.ADD:
                    self.set[key] = 1
                else:
                    if key in self.set:
                        del self.set[key]
            self.transactions = {}
            raise


def test4():
    s = SnapshotSet()

    s.add(1)
    s.add(2)
    s.add(3)
    for i in s:
        s.add(i + 3)
        print(s.__contains__(i + 3))
        print(i)

    for i in s:
        print(i)


"""
/*
Fastest Route to Databricks HQ
You live in San Francisco city and want to minimize your commute time to the Databricks HQ.
Given a 2D matrix of the San Francisco grid and the time as well as cost matrix of all the available transportation
modes, return the fastest mode of transportation. If there are multiple such modes then return one with the least cost.
Rules:
1. The input grid represents the city blocks, so the commuter is only allowed to travel along the horizontal and vertical axes.
Diagonal traversal is not permitted.
2. The commuter can only move to the neighboring cells with the same transportation mode.
Sample Input:
2D Grid:    Legend:
|3|3|S|2|X|X|   X = Roadblock
|3|1|1|2|X|2|   S = Source
|3|1|1|2|2|2|   D = Destination
|3|1|1|1|D|3|   1 = Walk, 2 = Bike, 3 = Car, 4 = Train
|3|3|3|3|3|4|
|4|4|4|4|4|4|
Transportation Modes:  ["Walk", "Bike", "Car", "Train"]
Cost Matrix (Dollars/Block): [0,  1,  3, 2]
Time Matrix (Minutes/Block): [3,  2,  1, 1]
NOTE: In this example, we are only counting the blocks between 'S' and 'D' to compute the minimum time & dollar cost.
Sample Output: Bike
*/
/*
walk:minTime, dollar ?
[0,2], [1,2], .... [3,4] 4 steps minTime: 4 * 3 = 12, cost: 4 * 0 = 0
bike: [0,2], [0,3], ... 4 stpes.minTime: 4 * 2 = 8, cost: 4 * 1 =4
car:...
train: ...
for each transportation:
bfs to find num of blocks
if cannot reach to desti, ignore this type
els:
  update minTime, minCost
o(m*n) time
o(m*n) space
 0 1 2 3 4 5
0 |3|3|S|2|X|X|
1 |3|1|1|2|X|2|
2 |3|1|1|2|2|2|
3 |3|1|1|1|D|3|
4 |3|3|3|3|3|4|
5 |4|4|4|4|4|4|
grid = {
{'3', '3', 'S', '2', 'X', 'X'},
{'3', '1', '1', '2', 'X', '2'},
{'3', '1', '1', '2', '2', '2'},
{'3', '1', '1', '1', 'D', '3'},
{'3', '3', '3', '3', '3', '4'},
{'4', '4', '4', '4', '4', '4'}
};
cost_matrix = {0, 1, 3, 2};
time_matrix = {3, 2, 1, 1};
*/
"""


def fastest_route(grid, transportation_modes, costs, times):
    start_i = -1
    start_j = -1
    end_i = -1
    end_j = -1
    m = len(grid)
    n = len(grid[0])

    dist = []
    for i in range(m):
        dist.append([])
        for j in range(n):
            dist[-1].append(-1)
            if grid[i][j] == 'S':
                start_i = i
                start_j = j
            if grid[i][j] == 'D':
                end_i = i
                end_j = j

    if start_i == -1 or end_i == -1:
        return ""

    leaves = [(start_i, start_j)]
    dist[start_i][start_j] = 0
    total_cost = [-1 for _ in costs]

    cost_dict = {'S': 0}
    time_dict = {'S': 0}
    mode_dict = {'S': ""}
    for i in range(len(costs)):
        cost_dict[str(i + 1)] = costs[i]
        time_dict[str(i + 1)] = times[i]
        mode_dict[str(i + 1)] = transportation_modes[i]

    min_cost = 999999
    min_time = 999999
    min_mode = ""

    while len(leaves) > 0:
        new_leaves = []

        for x, y in leaves:
            if (dist[x][y] * time_dict[grid[x][y]], dist[x][y] * cost_dict[grid[x][y]]) >= (min_time, min_cost):
                continue
            for dx, dy in [(-1, 0), (0, -1), (1, 0), (0, 1)]:
                xx = x + dx
                yy = y + dy
                if not (0 <= xx < m and 0 <= yy < n):
                    continue

                if grid[xx][yy] == 'D':
                    min_cost = dist[x][y] * cost_dict[grid[x][y]]
                    min_time = dist[x][y] * time_dict[grid[x][y]]
                    min_mode = mode_dict[grid[x][y]]
                    break

                if grid[x][y] == 'S':
                    new_leaves.append((xx, yy))
                    dist[xx][yy] = 1
                    continue

                if grid[xx][yy] != grid[x][y]:
                    continue

                if dist[xx][yy] != -1:
                    continue

                new_leaves.append((xx, yy))
                dist[xx][yy] = dist[x][y] + 1

        leaves = new_leaves

    return min_mode, min_cost, min_time


def test5():
    grid = [
        ['3', '3', 'S', '2', 'X', 'X'],
        ['3', '1', '1', '2', 'X', '2'],
        ['3', '1', '1', '2', '2', '2'],
        ['3', '1', '1', '1', 'D', '3'],
        ['3', '3', '3', '3', '3', '4'],
        ['4', '4', '4', '4', '4', '4']
    ]
    modes = ["Walk", "Bike", "Car", "Train"]
    cost_matrix = [0, 1, 3, 2]
    time_matrix = [3, 2, 1, 1]

    print(fastest_route(grid, modes, cost_matrix, time_matrix))

# https://leetcode.ca/all/348.html

class TicTacToe:
    def __init__(self, n, win_len):
        self.board = []
        for i in range(n):
            self.board.append([ 0 for _ in range(n)])
        self.win_len = win_len
        self.win = False

    def move_i(self, x, y, p):
        if self.win:
            return True
        if 0<=x<len(self.board) and 0 <=y<len(self.board[0]):
            self.board[x][y] = p
            if self.check_win(x,y):
                self.win = True
                return True
        return False

    def move(self, x, y, p):
        r = self.move_i(x, y, p)
        self.print_board()
        return r

    def print_board(self):
        for row in self.board:
            print("|".join(map(str,row)))
        print(self.win)

    def check_win(self,x,y):
        for dx, dy in [(-1,0),(-1,-1),(0,-1),(1,-1)]:
            if self.check_win_direction(x,y,dx,dy):
                return True
        return False
    def check_win_direction(self,x,y,dx,dy):
        count = 0
        for k in range(-self.win_len+1, self.win_len,1):
            xx = x + k * dx
            yy = y + k * dy
            if not( 0<=xx<len(self.board) and 0 <=yy<len(self.board[0])):
                continue
            if self.board[xx][yy] == self.board[x][y]:
                count += 1
                if count == self.win_len:
                    return True
            else:
                count = 0
        return False


def test6():
    toe = TicTacToe(5,3)

    toe.move(0, 0, 1)

    toe.move(0, 2, 2)

    toe.move(2, 2, 1)

    toe.move(1, 1, 2)

    toe.move(2, 0, 1)

    toe.move(1, 0, 2)

    toe.move(2, 1, 1)




# https://www.1point3acres.com/bbs/thread-1020796-1-1.html

def bottle_necks(nodes,edges):

    deps = {}

    for e in edges:
        if e[0] not in deps:
            deps[e[0]] = {}
        deps[e[0]][e[1]] = 1

    next_nodes = []
    for n in nodes:
        if n not in deps:
            next_nodes.append(n)

    ret = []
    while next_nodes:
        if len(next_nodes) == 1:
            ret.append(next_nodes[0])

        new_next_nodes = []

        for n in next_nodes:
            for p in deps:
                if n in deps[p]:
                    del deps[p][n]
                    if len(deps[p]) == 0:
                        new_next_nodes.append(p)

        for p in new_next_nodes:
            del deps[p]
        next_nodes = new_next_nodes

    return ret
"""

 A
/  \
B  C
|   |
D -E
   / \
  H   F
      |
      G
"""

class Test7(unittest.TestCase):
    def test_case1(self):
        res = bottle_necks([1, 2, 3, 4, 5, 6, 7, 8], [
            (1, 2),
            (1, 3),
            (2, 4),
            (4, 5),
            (3, 5),
            (5, 8),
            (5, 6),
            (6, 7),
        ])
        self.assertEqual([6,5,2,1], res)

unittest.main()