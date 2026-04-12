import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  OnModuleInit,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { CreateGrammarDto, UpdateGrammarDto } from './dto/grammar.dto';

const DEFAULT_GRAMMAR_DATA = [
  {
    title: 'Present Simple',
    structure: 'S + V(s/es)',
    explanation:
      'Dùng để diễn đạt thói quen, sự thật hiển nhiên, lịch biểu cố định.',
    examples: [
      'I work every day.',
      'She reads books in the morning.',
      'The sun rises in the east.',
    ],
    category: 'Thì hiện tại',
    level: 'A1',
  },
  {
    title: 'Present Continuous',
    structure: 'S + am/is/are + V-ing',
    explanation:
      'Dùng để diễn đạt hành động đang xảy ra ở thời điểm nói hoặc kế hoạch tương lai gần.',
    examples: [
      'I am studying English now.',
      'She is cooking dinner.',
      'They are playing football.',
    ],
    category: 'Thì hiện tại',
    level: 'A1',
  },
  {
    title: 'Present Perfect Simple',
    structure: 'S + have/has + V3',
    explanation:
      'Dùng để diễn đạt hành động đã xảy ra trong quá khứ nhưng còn liên quan đến hiện tại.',
    examples: [
      'I have eaten breakfast.',
      'She has finished her work.',
      'They have lived here for 5 years.',
    ],
    category: 'Thì hiện tại',
    level: 'B1',
  },
  {
    title: 'Present Perfect Continuous',
    structure: 'S + have/has been + V-ing',
    explanation:
      'Dùng để nhấn mạnh tính liên tục của hành động từ quá khứ đến hiện tại.',
    examples: [
      'I have been working for 3 hours.',
      'She has been studying all day.',
    ],
    category: 'Thì hiện tại',
    level: 'B1',
  },
  {
    title: 'Past Simple',
    structure: 'S + V2/ed',
    explanation:
      'Dùng để diễn đạt hành động đã xảy ra và kết thúc trong quá khứ.',
    examples: [
      'I worked yesterday.',
      'She went to school.',
      'They played football last week.',
    ],
    category: 'Thì quá khứ',
    level: 'A1',
  },
  {
    title: 'Past Continuous',
    structure: 'S + was/were + V-ing',
    explanation:
      'Dùng để diễn đạt hành động đang diễn ra tại một thời điểm cụ thể trong quá khứ.',
    examples: ['I was sleeping at 9pm.', 'She was cooking when he arrived.'],
    category: 'Thì quá khứ',
    level: 'A2',
  },
  {
    title: 'Past Perfect',
    structure: 'S + had + V3',
    explanation:
      'Dùng để diễn đạt hành động xảy ra trước một hành động khác trong quá khứ.',
    examples: [
      'I had eaten before she arrived.',
      'They had left when we got there.',
    ],
    category: 'Thì quá khứ',
    level: 'B1',
  },
  {
    title: 'Past Perfect Continuous',
    structure: 'S + had been + V-ing',
    explanation:
      'Dùng để nhấn mạnh tính liên tục của hành động trước một thời điểm trong quá khứ.',
    examples: ['I had been working for 2 hours before the meeting.'],
    category: 'Thì quá khứ',
    level: 'B2',
  },
  {
    title: 'Future Simple (will)',
    structure: 'S + will + V',
    explanation: 'Dùng để diễn đạt quyết định tức thời, dự đoán, lời hứa.',
    examples: [
      'I will help you.',
      'It will rain tomorrow.',
      'She will call you later.',
    ],
    category: 'Thì tương lai',
    level: 'A2',
  },
  {
    title: 'Future Simple (be going to)',
    structure: 'S + am/is/are going to + V',
    explanation:
      'Dùng để diễn đạt kế hoạch đã định, dự đoán dựa trên bằng chứng.',
    examples: [
      "I'm going to visit Paris next year.",
      "Look at those clouds – it's going to rain.",
    ],
    category: 'Thì tương lai',
    level: 'A2',
  },
  {
    title: 'Future Continuous',
    structure: 'S + will be + V-ing',
    explanation:
      'Dùng để diễn đạt hành động đang diễn ra tại một thời điểm cụ thể trong tương lai.',
    examples: [
      'I will be sleeping at midnight.',
      'She will be working when you arrive.',
    ],
    category: 'Thì tương lai',
    level: 'B1',
  },
  {
    title: 'Future Perfect',
    structure: 'S + will have + V3',
    explanation:
      'Dùng để diễn đạt hành động sẽ hoàn thành trước một thời điểm trong tương lai.',
    examples: [
      'By next year, I will have graduated.',
      'She will have finished by 5pm.',
    ],
    category: 'Thì tương lai',
    level: 'B2',
  },
  {
    title: 'Zero Conditional',
    structure: 'If + present simple, present simple',
    explanation: 'Dùng để diễn đạt các sự thật hiển nhiên, điều luôn đúng.',
    examples: [
      'If you heat water to 100°C, it boils.',
      'If it rains, the grass gets wet.',
    ],
    category: 'Câu điều kiện',
    level: 'A2',
  },
  {
    title: 'First Conditional',
    structure: 'If + present simple, will + V',
    explanation: 'Dùng để diễn đạt điều kiện có thể xảy ra trong tương lai.',
    examples: [
      'If it rains, I will stay home.',
      'If you study hard, you will pass.',
    ],
    category: 'Câu điều kiện',
    level: 'B1',
  },
  {
    title: 'Second Conditional',
    structure: 'If + past simple, would + V',
    explanation: 'Dùng để diễn đạt điều kiện không thực, giả định.',
    examples: [
      'If I were rich, I would travel the world.',
      'If she had time, she would help you.',
    ],
    category: 'Câu điều kiện',
    level: 'B1',
  },
  {
    title: 'Third Conditional',
    structure: 'If + past perfect, would have + V3',
    explanation: 'Dùng để diễn đạt điều kiện không thực trong quá khứ.',
    examples: [
      'If I had studied, I would have passed the exam.',
      'If she had known, she would have helped.',
    ],
    category: 'Câu điều kiện',
    level: 'B2',
  },
  {
    title: 'Passive Voice (Present Simple)',
    structure: 'S + am/is/are + V3',
    explanation:
      'Dùng câu bị động thì hiện tại đơn khi muốn nhấn mạnh đối tượng chịu tác động.',
    examples: ['The book is written by him.', 'English is spoken worldwide.'],
    category: 'Câu bị động',
    level: 'B1',
  },
  {
    title: 'Passive Voice (Past Simple)',
    structure: 'S + was/were + V3',
    explanation: 'Câu bị động thì quá khứ đơn.',
    examples: ['The window was broken.', 'The letter was written by her.'],
    category: 'Câu bị động',
    level: 'B1',
  },
  {
    title: 'Reported Speech (Statements)',
    structure: 'S + said (that) + clause',
    explanation: 'Dùng để thuật lại lời nói trực tiếp của người khác.',
    examples: ['She said she was tired.', 'He told me he would help.'],
    category: 'Câu tường thuật',
    level: 'B1',
  },
  {
    title: 'Reported Speech (Questions)',
    structure: 'S + asked + if/whether/wh-word + clause',
    explanation: 'Dùng để thuật lại câu hỏi của người khác.',
    examples: ['She asked if I was hungry.', 'He asked where I lived.'],
    category: 'Câu tường thuật',
    level: 'B1',
  },
  {
    title: 'Gerund vs Infinitive',
    structure: 'V + gerund (V-ing) / V + to + V',
    explanation:
      'Một số động từ dùng gerund, một số dùng infinitive, một số dùng cả hai.',
    examples: [
      'I enjoy swimming.',
      'She wants to travel.',
      'He stopped smoking.',
    ],
    category: 'Gerund & Infinitive',
    level: 'B1',
  },
  {
    title: 'Modal Verbs – Can/Could',
    structure: 'S + can/could + V',
    explanation: 'Dùng để diễn đạt khả năng, cho phép, đề nghị lịch sự.',
    examples: [
      'I can swim.',
      'Could you help me?',
      'She could speak French when she was young.',
    ],
    category: 'Động từ khiếm khuyết',
    level: 'A2',
  },
  {
    title: 'Modal Verbs – Should/Must',
    structure: 'S + should/must + V',
    explanation: 'Should: lời khuyên. Must: bắt buộc, nghĩa vụ.',
    examples: [
      'You should exercise regularly.',
      'You must wear a seatbelt.',
      'I must finish this today.',
    ],
    category: 'Động từ khiếm khuyết',
    level: 'B1',
  },
  {
    title: 'Relative Clauses',
    structure: 'N + who/which/that/where + clause',
    explanation: 'Mệnh đề quan hệ dùng để bổ nghĩa cho danh từ.',
    examples: [
      'The man who works here is kind.',
      'The book that I read was interesting.',
      'The city where I was born is beautiful.',
    ],
    category: 'Mệnh đề quan hệ',
    level: 'B1',
  },
  {
    title: 'Comparatives and Superlatives',
    structure: 'adj + -er than / the + adj + -est',
    explanation: 'Dùng để so sánh hai hoặc nhiều hơn hai đối tượng.',
    examples: [
      'She is taller than her sister.',
      'He is the smartest student.',
      'English is easier than Chinese.',
    ],
    category: 'Tính từ so sánh',
    level: 'A2',
  },
  {
    title: 'Articles – a/an/the',
    structure: 'a + consonant noun / an + vowel noun / the + specific noun',
    explanation: 'a/an: mạo từ không xác định. the: mạo từ xác định.',
    examples: [
      'I saw a dog.',
      'It was an interesting book.',
      'The dog I saw was cute.',
    ],
    category: 'Mạo từ',
    level: 'A1',
  },
  {
    title: 'Prepositions of Time',
    structure: 'at + time / on + day / in + period',
    explanation:
      'at: giờ cụ thể. on: ngày trong tuần/ngày cụ thể. in: tháng, năm, buổi.',
    examples: ["at 9 o'clock", 'on Monday', 'in January', 'in the morning'],
    category: 'Giới từ',
    level: 'A1',
  },
  {
    title: 'Present Simple for Habits',
    structure: 'S + V(s/es) + frequency adverb',
    explanation:
      'Dùng trạng từ tần suất với thì hiện tại đơn để diễn đạt thói quen.',
    examples: [
      'I always wake up at 7am.',
      'She usually drinks coffee.',
      'He never smokes.',
    ],
    category: 'Thì hiện tại',
    level: 'A1',
  },
  {
    title: 'Question Tags',
    structure: 'sentence + aux + pronoun?',
    explanation: 'Câu hỏi đuôi dùng để xác nhận thông tin.',
    examples: [
      "It's a nice day, isn't it?",
      "You can swim, can't you?",
      "She doesn't work here, does she?",
    ],
    category: 'Câu hỏi',
    level: 'B1',
  },
];

@Injectable()
export class GrammarService implements OnModuleInit {
  private readonly logger = new Logger(GrammarService.name);

  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    await this.seedDefaultGrammar();
  }

  private async seedDefaultGrammar() {
    const count = await this.prisma.grammarStructure.count({
      where: { isDefault: true },
    });
    if (count === 0) {
      try {
        await this.prisma.grammarStructure.createMany({
          data: DEFAULT_GRAMMAR_DATA.map((g) => ({
            ...g,
            examples: g.examples,
            isDefault: true,
          })),
          skipDuplicates: true,
        });
        this.logger.log(
          `Seeded ${DEFAULT_GRAMMAR_DATA.length} default grammar structures`,
        );
      } catch (error) {
        this.logger.warn(
          'Could not seed grammar data – migration may not be applied yet.',
        );
      }
    }
  }

  async getAll(
    page = 1,
    limit = 20,
    search?: string,
    category?: string,
    level?: string,
  ) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { structure: { contains: search, mode: 'insensitive' } },
        { explanation: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (category) where.category = { contains: category, mode: 'insensitive' };
    if (level) where.level = level;

    const [items, total] = await Promise.all([
      this.prisma.grammarStructure.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ isDefault: 'desc' }, { category: 'asc' }, { title: 'asc' }],
        include: {
          author: { select: { id: true, username: true, fullName: true } },
        },
      }),
      this.prisma.grammarStructure.count({ where }),
    ]);

    return {
      items,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getCategories() {
    const items = await this.prisma.grammarStructure.findMany({
      select: { category: true },
      distinct: ['category'],
      where: { category: { not: null } },
      orderBy: { category: 'asc' },
    });
    return { categories: items.map((i) => i.category).filter(Boolean) };
  }

  async getById(id: string) {
    const item = await this.prisma.grammarStructure.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, username: true, fullName: true } },
      },
    });
    if (!item) throw new NotFoundException('Không tìm thấy cấu trúc ngữ pháp');
    return { item };
  }

  async create(userId: string, dto: CreateGrammarDto) {
    const item = await this.prisma.grammarStructure.create({
      data: {
        title: dto.title,
        structure: dto.structure,
        explanation: dto.explanation,
        examples: dto.examples ?? [],
        category: dto.category,
        level: dto.level,
        isDefault: false,
        authorId: userId,
      },
    });
    return { message: 'Tạo cấu trúc ngữ pháp thành công', item };
  }

  async update(id: string, userId: string, dto: UpdateGrammarDto) {
    const item = await this.prisma.grammarStructure.findUnique({
      where: { id },
    });
    if (!item) throw new NotFoundException('Không tìm thấy cấu trúc ngữ pháp');
    if (!item.isDefault && item.authorId !== userId) {
      throw new ForbiddenException('Bạn không có quyền chỉnh sửa mục này');
    }

    const updated = await this.prisma.grammarStructure.update({
      where: { id },
      data: dto,
    });
    return { message: 'Cập nhật thành công', item: updated };
  }

  async delete(id: string, userId: string) {
    const item = await this.prisma.grammarStructure.findUnique({
      where: { id },
    });
    if (!item) throw new NotFoundException('Không tìm thấy cấu trúc ngữ pháp');
    if (item.isDefault || item.authorId !== userId) {
      throw new ForbiddenException('Bạn không có quyền xóa mục này');
    }
    await this.prisma.grammarStructure.delete({ where: { id } });
    return { message: 'Xóa thành công' };
  }
}
