/** 模拟题 F 组：第 9~13 章补充题库（依据考纲自编，答案已校验） */

const m = (o) => ({ real: false, difficulty: 2, ...o })

export const mockF = [
  /* ---------------- 第 9 章 算法设计与分析 ---------------- */
  m({ id: 'mf-09-01', chapterId: 'ch09', sectionId: 'ch09-2', stem: '归并排序采用的算法设计策略是（　）。', options: ['分治法', '动态规划', '贪心法', '回溯法'], answer: 0, analysis: '归并把数组一分为二，分别排序后合并，子问题独立，属于典型的分治策略。' }),
  m({ id: 'mf-09-02', chapterId: 'ch09', sectionId: 'ch09-3', stem: '动态规划算法适用的两个基本要素是（　）。', options: ['最优子结构与重叠子问题', '贪心选择性质与无后效性', '深度优先与剪枝', '随机化与近似'], answer: 0, analysis: '最优子结构保证可递归构造最优解，重叠子问题使“记忆化/填表”有意义。' }),
  m({ id: 'mf-09-03', chapterId: 'ch09', sectionId: 'ch09-4', stem: '分数背包问题可以采用贪心法求解，其关键依据是（　）。', options: ['物品不可分割', '物品可以分割，按单位价值排序即可最优', '物品数量很少', '价值与重量成正比'], answer: 1, analysis: '物品可分割时，优先装入单位价值最高的物品直到装满，可证明得到最优解；0-1 背包不可分割则不行。' }),
  m({ id: 'mf-09-04', chapterId: 'ch09', sectionId: 'ch09-5', stem: 'N 皇后问题通常采用（　）求解。', options: ['贪心法', '回溯法', '动态规划', '分治法'], answer: 1, analysis: 'N 皇后需在解空间树中深度优先搜索，逐行放置并用列/对角线约束剪枝，属于回溯法。' }),
  m({ id: 'mf-09-05', chapterId: 'ch09', sectionId: 'ch09-5', stem: '分支限界法主要用于求解（　）。', options: ['所有可行解', '最优解', '判定问题', '近似解'], answer: 1, analysis: '分支限界法以广度优先或最小耗费优先扩展结点，配合限界函数剪枝，目标是找最优解。' }),
  m({ id: 'mf-09-06', chapterId: 'ch09', sectionId: 'ch09-2', stem: '某算法满足 T(n)=2T(n/2)+n²，则其时间复杂度为（　）。', options: ['O(n log n)', 'O(n²)', 'O(n² log n)', 'O(n³)'], answer: 1, analysis: 'n^(log₂2)=n，而 f(n)=n² 更高阶且满足正则条件，由主定理得 T(n)=O(n²)。' }),
  m({ id: 'mf-09-07', chapterId: 'ch09', sectionId: 'ch09-3', stem: '0-1 背包用一维数组优化时，内层循环必须（　）。', options: ['正序遍历容量', '倒序遍历容量', '从 0 到 n 遍历物品', '任意顺序'], answer: 1, analysis: '倒序保证每件物品只被使用一次；正序会使同一物品被重复放入，退化为完全背包。' }),
  m({ id: 'mf-09-08', chapterId: 'ch09', sectionId: 'ch09-3', stem: '求两个长度分别为 m、n 的字符串的最长公共子序列，动态规划的时间复杂度为（　）。', options: ['O(m+n)', 'O(m×n)', 'O(m²)', 'O(2^m)'], answer: 1, analysis: '需填 (m+1)×(n+1) 的二维表，每格常数时间，故为 O(mn)。' }),
  m({ id: 'mf-09-09', chapterId: 'ch09', sectionId: 'ch09-4', stem: '活动安排问题中，贪心策略应按（　）排序。', options: ['活动开始时间升序', '活动结束时间升序', '活动持续时间升序', '活动数量升序'], answer: 1, analysis: '按结束时间升序选择，可为后续活动留下最多时间，该贪心策略可证明最优。' }),
  m({ id: 'mf-09-10', chapterId: 'ch09', sectionId: 'ch09-5', stem: '总能给出解但可能不正确的概率算法是（　）。', options: ['蒙特卡罗算法', '拉斯维加斯算法', '舍伍德算法', '确定性算法'], answer: 0, analysis: '蒙特卡罗算法一定返回结果，但存在极小错误概率；拉斯维加斯算法结果一定正确但可能失败。' }),
  m({ id: 'mf-09-11', chapterId: 'ch09', sectionId: 'ch09-4', stem: '贪心法不能保证得到全局最优解的根本原因是（　）。', options: ['算法效率太低', '每步只做局部最优选择且不回溯', '不能处理大规模数据', '必须使用递归'], answer: 1, analysis: '贪心不回溯，局部最优的累积未必等于全局最优；只有在满足贪心选择性质时才能保证最优。' }),
  m({ id: 'mf-09-12', chapterId: 'ch09', sectionId: 'ch09-1', stem: 'Floyd 算法求每对顶点间最短路径，采用的策略是（　）。', options: ['贪心', '动态规划', '分治', '回溯'], answer: 1, analysis: 'Floyd 通过逐步允许中间顶点 k，递推更新 dist[i][j]，是典型的动态规划，复杂度 O(n³)。' }),

  /* ---------------- 第 10 章 面向对象 ---------------- */
  m({ id: 'mf-10-01', chapterId: 'ch10', sectionId: 'ch10-1', stem: '将对象的属性私有化、仅通过公开方法访问，体现的是（　）。', options: ['继承', '封装', '多态', '抽象'], answer: 1, analysis: '封装隐藏内部实现细节，只暴露必要接口，降低耦合、提高可维护性。' }),
  m({ id: 'mf-10-02', chapterId: 'ch10', sectionId: 'ch10-1', stem: '子类自动拥有父类的属性与方法，这种机制称为（　）。', options: ['封装', '继承', '多态', '重载'], answer: 1, analysis: '继承表达一般与特殊（is-a）关系，实现代码复用与层次化设计。' }),
  m({ id: 'mf-10-03', chapterId: 'ch10', sectionId: 'ch10-1', stem: '同一操作作用于不同对象产生不同执行结果，称为（　）。', options: ['重载', '多态', '封装', '泛化'], answer: 1, analysis: '多态使同一消息在不同对象上有不同实现，运行时通过动态绑定确定具体方法。' }),
  m({ id: 'mf-10-04', chapterId: 'ch10', sectionId: 'ch10-1', stem: '同一个类中方法名相同、参数列表不同，这属于（　）。', options: ['覆盖', '重载', '重写', '隐藏'], answer: 1, analysis: '重载（Overload）发生在同一类内，参数列表必须不同，编译期绑定；覆盖（Override）发生在父子类间。' }),
  m({ id: 'mf-10-05', chapterId: 'ch10', sectionId: 'ch10-2', stem: 'UML 类图中，实心菱形表示（　）。', options: ['聚合', '组合', '关联', '依赖'], answer: 1, analysis: '实心菱形为组合（同生共死），空心菱形为聚合（部分可独立存在），菱形位于整体一端。' }),
  m({ id: 'mf-10-06', chapterId: 'ch10', sectionId: 'ch10-2', stem: '若类 A 仅在方法参数中临时使用类 B，则二者的关系是（　）。', options: ['关联', '聚合', '依赖', '泛化'], answer: 2, analysis: '临时使用（局部变量、参数、静态调用）属于依赖，用虚线箭头表示。' }),
  m({ id: 'mf-10-07', chapterId: 'ch10', sectionId: 'ch10-2', stem: '用例图中，“登录”被多个用例复用且必然执行，应采用（　）关系。', options: ['include', 'extend', '泛化', '聚合'], answer: 0, analysis: '必然执行的公共子流程用 include（包含）；条件满足才执行的附加行为用 extend（扩展）。' }),
  m({ id: 'mf-10-08', chapterId: 'ch10', sectionId: 'ch10-2', stem: '强调对象之间消息交互时间顺序的 UML 图是（　）。', options: ['类图', '序列图', '状态图', '部署图'], answer: 1, analysis: '序列图（时序图）以纵向时间轴展示对象间的消息往来，强调先后顺序。' }),
  m({ id: 'mf-10-09', chapterId: 'ch10', sectionId: 'ch10-2', stem: '描述一个对象在生命周期内状态变迁的 UML 图是（　）。', options: ['活动图', '状态图', '用例图', '构件图'], answer: 1, analysis: '状态图描述单个对象的状态、事件与迁移；活动图描述业务流程或算法流程。' }),
  m({ id: 'mf-10-10', chapterId: 'ch10', sectionId: 'ch10-4', stem: '保证一个类只有一个实例并提供全局访问点，应采用（　）。', options: ['原型模式', '单例模式', '工厂方法', '享元模式'], answer: 1, analysis: '单例模式私有化构造器、提供静态实例与静态获取方法，常用于配置管理、连接池。' }),
  m({ id: 'mf-10-11', chapterId: 'ch10', sectionId: 'ch10-4', stem: '定义创建对象的接口，由子类决定实例化哪个类，这是（　）。', options: ['抽象工厂', '工厂方法', '建造者', '原型'], answer: 1, analysis: '工厂方法把对象的创建延迟到子类；抽象工厂用于创建一系列相关产品（产品族）。' }),
  m({ id: 'mf-10-12', chapterId: 'ch10', sectionId: 'ch10-4', stem: '一个对象状态改变时自动通知所有依赖它的对象，应采用（　）。', options: ['观察者模式', '状态模式', '策略模式', '中介者模式'], answer: 0, analysis: '观察者模式定义一对多依赖，被观察者变化时通知所有观察者，是事件驱动与 MVC 的基础。' }),
  m({ id: 'mf-10-13', chapterId: 'ch10', sectionId: 'ch10-4', stem: '动态地给对象添加额外职责，比继承更灵活，应采用（　）。', options: ['代理模式', '装饰器模式', '适配器模式', '外观模式'], answer: 1, analysis: '装饰器通过包装并转发请求来动态增强功能，可层层嵌套；代理侧重控制访问。' }),
  m({ id: 'mf-10-14', chapterId: 'ch10', sectionId: 'ch10-4', stem: '使原本不兼容的两个接口能够协同工作，应采用（　）。', options: ['桥接模式', '适配器模式', '组合模式', '享元模式'], answer: 1, analysis: '适配器转换接口，使已有类能在新接口下工作，属于结构型模式。' }),
  m({ id: 'mf-10-15', chapterId: 'ch10', sectionId: 'ch10-5', stem: '“对扩展开放、对修改关闭”是（　）原则。', options: ['单一职责', '开闭原则', '里氏替换', '接口隔离'], answer: 1, analysis: '开闭原则是面向对象设计的核心原则，要求新增功能时扩展而非修改既有代码。' }),
  m({ id: 'mf-10-16', chapterId: 'ch10', sectionId: 'ch10-5', stem: '“依赖抽象而非具体实现”体现的是（　）。', options: ['依赖倒置原则', '单一职责原则', '迪米特法则', '合成复用原则'], answer: 0, analysis: '依赖倒置要求高层模块与低层模块都依赖抽象，抽象不依赖细节，即面向接口编程。' }),

  /* ---------------- 第 11 章 软件工程 ---------------- */
  m({ id: 'mf-11-01', chapterId: 'ch11', sectionId: 'ch11-1', stem: '瀑布模型的主要缺点是（　）。', options: ['文档太少', '难以适应需求变更', '不能分阶段', '无法评审'], answer: 1, analysis: '瀑布模型阶段严格串行、文档驱动，需求变更代价高，风险后置到测试阶段才暴露。' }),
  m({ id: 'mf-11-02', chapterId: 'ch11', sectionId: 'ch11-1', stem: '当用户需求不明确时，最适合采用（　）。', options: ['瀑布模型', '原型模型', 'V 模型', '净室模型'], answer: 1, analysis: '原型模型通过可运行原型与用户反复确认需求，适合需求模糊的项目。' }),
  m({ id: 'mf-11-03', chapterId: 'ch11', sectionId: 'ch11-1', stem: '以风险分析为核心、每轮都进行风险评审的模型是（　）。', options: ['增量模型', '螺旋模型', '喷泉模型', 'RUP'], answer: 1, analysis: '螺旋模型是风险驱动的，每圈包含计划、风险分析、实施、评审四个象限。' }),
  m({ id: 'mf-11-04', chapterId: 'ch11', sectionId: 'ch11-1', stem: '增量模型的主要优点是（　）。', options: ['一次性交付全部功能', '可以尽早交付可用功能并降低风险', '不需要需求分析', '不需要测试'], answer: 1, analysis: '增量模型分批交付可运行的子集，用户可尽早使用并反馈，风险分散到各增量。' }),
  m({ id: 'mf-11-05', chapterId: 'ch11', sectionId: 'ch11-3', stem: '模块之间通过参数传递简单数据，这种耦合是（　）。', options: ['数据耦合', '标记耦合', '控制耦合', '内容耦合'], answer: 0, analysis: '传递简单数据为数据耦合，是耦合度最低、最理想的方式；传数据结构为标记耦合。' }),
  m({ id: 'mf-11-06', chapterId: 'ch11', sectionId: 'ch11-3', stem: '模块内所有元素共同完成一个单一功能，属于（　）内聚。', options: ['逻辑内聚', '时间内聚', '通信内聚', '功能内聚'], answer: 3, analysis: '功能内聚是最高层次的内聚，模块内元素缺一不可、协同完成单一功能。' }),
  m({ id: 'mf-11-07', chapterId: 'ch11', sectionId: 'ch11-4', stem: '只要求每条可执行语句至少执行一次的覆盖标准是（　）。', options: ['语句覆盖', '判定覆盖', '条件覆盖', '路径覆盖'], answer: 0, analysis: '语句覆盖是最弱的白盒覆盖标准；路径覆盖最强，需覆盖所有可能路径。' }),
  m({ id: 'mf-11-08', chapterId: 'ch11', sectionId: 'ch11-4', stem: '某程序流程图有 15 条边、12 个结点，其 McCabe 复杂度为（　）。', options: ['3', '4', '5', '15'], answer: 2, analysis: 'V(G) = E − N + 2 = 15 − 12 + 2 = 5，也等于判定结点数 + 1。' }),
  m({ id: 'mf-11-09', chapterId: 'ch11', sectionId: 'ch11-4', stem: '对输入范围 1~12 取 0、1、12、13 进行测试，属于（　）。', options: ['等价类划分', '边界值分析', '错误推测', '正交试验'], answer: 1, analysis: '取边界值及其两侧（刚好越界、等于边界），是边界值分析法。' }),
  m({ id: 'mf-11-10', chapterId: 'ch11', sectionId: 'ch11-5', stem: '为适应操作系统升级而修改软件，属于（　）维护。', options: ['改正性', '适应性', '改善性', '预防性'], answer: 1, analysis: '外部运行环境（操作系统、硬件、数据格式）变化引起的修改属于适应性维护。' }),
  m({ id: 'mf-11-11', chapterId: 'ch11', sectionId: 'ch11-6', stem: 'PERT 图中，关键路径是（　）。', options: ['边数最少的路径', '耗时最长的路径', '耗时最短的路径', '结点最多的路径'], answer: 1, analysis: '关键路径是耗时最长的路径，其长度决定项目最短工期，路径上活动松弛时间为 0。' }),
  m({ id: 'mf-11-12', chapterId: 'ch11', sectionId: 'ch11-6', stem: 'CMM 模型中，过程已标准化、文档化的等级是（　）。', options: ['可重复级', '已定义级', '已管理级', '优化级'], answer: 1, analysis: 'CMM 三级为已定义级，组织建立标准软件过程并据此裁剪项目过程。' }),
  m({ id: 'mf-11-13', chapterId: 'ch11', sectionId: 'ch11-7', stem: 'ISO 9126 中，“软件被修改的难易程度”属于（　）。', options: ['功能性', '可靠性', '可维护性', '可移植性'], answer: 2, analysis: '可维护性包含易分析性、易改变性、稳定性和易测试性，反映修改的难易。' }),
  m({ id: 'mf-11-14', chapterId: 'ch11', sectionId: 'ch11-4', stem: '针对单个模块内部逻辑进行的测试属于（　）。', options: ['单元测试', '集成测试', '系统测试', '验收测试'], answer: 0, analysis: '单元测试针对单个模块或类，依据详细设计，多用白盒方法，由开发人员完成。' }),
  m({ id: 'mf-11-15', chapterId: 'ch11', sectionId: 'ch11-2', stem: '数据流图中，用圆角矩形（或圆）表示（　）。', options: ['外部实体', '数据加工', '数据存储', '数据流'], answer: 1, analysis: '数据加工用圆或圆角矩形；外部实体用矩形；数据存储用开口矩形；数据流用带箭头连线。' }),
  m({ id: 'mf-11-16', chapterId: 'ch11', sectionId: 'ch11-6', stem: '配置管理中，经过评审确认、作为后续开发基准的配置项集合称为（　）。', options: ['基线', '版本', '里程碑', '变更单'], answer: 0, analysis: '基线是经评审确认的配置项集合，基线一旦建立，变更必须走变更控制流程。' }),

  /* ---------------- 第 12 章 专业英语 ---------------- */
  m({ id: 'mf-12-01', chapterId: 'ch12', sectionId: 'ch12-2', stem: 'In software design, "coupling" refers to ____.', options: ['the degree of interdependence between modules', 'the degree to which elements within a module belong together', 'the number of lines of code', 'the execution time of a program'], answer: 0, analysis: 'coupling 指模块之间的依赖程度（耦合），越低越好；模块内部的紧密程度是 cohesion（内聚）。' }),
  m({ id: 'mf-12-02', chapterId: 'ch12', sectionId: 'ch12-2', stem: 'Which pattern converts the interface of a class into another interface clients expect?', options: ['Adapter', 'Observer', 'Strategy', 'Composite'], answer: 0, analysis: 'Adapter（适配器）转换接口，使原本不兼容的类可以协同工作。' }),
  m({ id: 'mf-12-03', chapterId: 'ch12', sectionId: 'ch12-2', stem: 'A "primary key" in a relational table is used to ____.', options: ['uniquely identify each row', 'link two tables', 'sort the records', 'compress the data'], answer: 0, analysis: 'primary key（主键）唯一标识表中的每一行；foreign key（外键）用于联系两张表。' }),
  m({ id: 'mf-12-04', chapterId: 'ch12', sectionId: 'ch12-2', stem: 'A compiler differs from an interpreter in that a compiler ____.', options: ['executes the source code line by line', 'produces a separate target program', 'does not check syntax', 'cannot optimize code'], answer: 1, analysis: '编译器生成独立的目标程序；解释器逐行解释执行、不生成目标代码。' }),
  m({ id: 'mf-12-05', chapterId: 'ch12', sectionId: 'ch12-2', stem: '"Polymorphism" in object-oriented design means ____.', options: ['the same message can produce different behaviors on different objects', 'a class can have only one instance', 'data is hidden inside a class', 'a subclass inherits from a superclass'], answer: 0, analysis: 'polymorphism（多态）：同一消息作用于不同对象产生不同行为，运行时动态绑定。' }),
  m({ id: 'mf-12-06', chapterId: 'ch12', sectionId: 'ch12-2', stem: 'Which layer of the OSI model is responsible for routing?', options: ['Data link layer', 'Network layer', 'Transport layer', 'Session layer'], answer: 1, analysis: '网络层（Network layer）负责逻辑寻址与路由选择。' }),

  /* ---------------- 第 13 章 应用技术专题 ---------------- */
  m({ id: 'mf-13-01', chapterId: 'ch13', sectionId: 'ch13-2', stem: '数据流图中，位于系统边界之外、不属于待开发系统内部的是（　）。', options: ['数据加工', '数据存储', '外部实体', '数据流'], answer: 2, analysis: '外部实体是系统的数据来源或去向，位于系统之外；加工、存储、数据流才是系统内部要素。' }),
  m({ id: 'mf-13-02', chapterId: 'ch13', sectionId: 'ch13-2', stem: '父图的输入输出数据流必须与子图边界上的数据流一致，这一原则称为（　）。', options: ['数据守恒', '父子图平衡', '自顶向下', '逐步求精'], answer: 1, analysis: '父子图平衡要求父图与子图在边界上的输入输出一一对应；数据守恒指输出可由输入推导。' }),
  m({ id: 'mf-13-03', chapterId: 'ch13', sectionId: 'ch13-3', stem: '将 E-R 图转换为关系模式时，1:n 的联系应（　）。', options: ['单独建表', '并入 1 端', '并入 n 端并加入 1 端主键', '忽略'], answer: 2, analysis: '1:n 联系并入 n 端，把 1 端主键作为外键加入，联系自身的属性也一并加入 n 端表。' }),
  m({ id: 'mf-13-04', chapterId: 'ch13', sectionId: 'ch13-3', stem: 'm:n 联系转换为关系模式时，其主键应为（　）。', options: ['任一端的主键', '两端主键的组合', '联系自身的属性', '新增的代理键'], answer: 1, analysis: 'm:n 联系必须独立成表，主键由两端实体的主键组合而成，联系属性作为非主属性。' }),
  m({ id: 'mf-13-05', chapterId: 'ch13', sectionId: 'ch13-4', stem: '在 UML 类图中，若“窗口”销毁时其内部“按钮”也随之销毁，则二者是（　）。', options: ['依赖关系', '聚合关系', '组合关系', '泛化关系'], answer: 2, analysis: '同生共死、部分不能独立存在，属于组合关系，用实心菱形表示。' }),
  m({ id: 'mf-13-06', chapterId: 'ch13', sectionId: 'ch13-5', stem: '最长公共子序列动态规划代码中，当 a[i-1]==b[j-1] 时，dp[i][j] 应等于（　）。', options: ['dp[i-1][j-1]+1', 'dp[i-1][j]+1', 'max(dp[i-1][j],dp[i][j-1])', '0'], answer: 0, analysis: '字符相等时，该字符一定属于某个最长公共子序列，故 dp[i][j] = dp[i-1][j-1] + 1；不等时取两者最大值。' }),
  m({ id: 'mf-13-07', chapterId: 'ch13', sectionId: 'ch13-1', stem: '应用技术科目中，每题的分值通常为（　）。', options: ['10 分', '15 分', '20 分', '25 分'], answer: 1, analysis: '应用技术共 5 道大题，每题 15 分，满分 75 分，45 分合格。' }),
  m({ id: 'mf-13-08', chapterId: 'ch13', sectionId: 'ch13-6', stem: 'Java 中实现接口使用的关键字是（　）。', options: ['extends', 'implements', 'implements abstract', 'interface'], answer: 1, analysis: '类继承类用 extends，类实现接口用 implements；接口本身用 interface 定义。' })
]

export default mockF
